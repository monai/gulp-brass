var ld = require('lodash');
var dz = require('dezalgo');
var fs = require('graceful-fs');
var path = require('path');
var exec = require('child_process').exec;
var async = require('async');
var gutil = require('gulp-util');
var mkdirp = require('mkdirp');
var through = require('through2');

var $rpm = {};

$rpm.setup = function $setup(callback) {
    setup(this, dz(callback));
};

$rpm.setupTask = function $setupTask() {
    return $rpm.setup.bind(this);
};

$rpm.files = function $files(options) {
    return files(this, options);
}

$rpm.build = function $build(callback) {
    build(this, dz(callback));
}

$rpm.buildTask = function $buildTask() {
    return $rpm.build.bind(this);
}

$rpm.renderFileList = function $renderFileList() {
    return renderFileList(this);
}

$rpm.renderSpecFile = function $renderSpecFile(callback) {
    return renderSpecFile(this, dz(callback));
}

module.exports = {
    create: create,
    setup: setup,
    files: files,
    build: build,
    renderFileList: renderFileList
};

function create(options) {
    var rpm;
    
    rpm = Object.create($rpm);
    rpm.options = options;
    rpm.buildDir = options.buildDir;
    rpm.buildRoot = null;
    rpm.fileList = [];
    rpm.specFileList = null;
    
    return rpm;
}

function setup(instance, callback) {
    var fullpath;
    
    // gutil.log('Preapring build directories', { em: true });
    
    async.series([
        function (callback) {
            fullpath = path.join(instance.buildDir, 'tmp');
            instance.buildRoot = fullpath;
            
            // gutil.log('Creating directory: '+ fullpath);
            
            mkdirp(fullpath, callback);
        }, function (callback) {
            async.eachSeries([ 'BUILD', 'RPMS', 'SOURCES', 'SPECS', 'SRPMS' ], function (dir, callback) {
                fullpath = path.join(instance.buildDir, dir);
                instance['buildDir_'+ dir] = fullpath;
                
                // gutil.log('Creating directory: '+ fullpath);
                
                mkdirp(fullpath, callback);
            }, callback);
        }
    ], callback);
}

function files(instance, options) {
    return through.obj(function (file, enc, callback) {
        file.base = instance.buildRoot;
        instance.fileList.push(file);
        dz(callback)(null, file);
    });
}

function build(instance, callback) {
    var command;
    
    // gutil.log('Building package', { em: true });
    
    command = ([
        'rpmbuild',
        '-ba',
        '--buildroot', instance.buildRoot,
        'spec'
    ]).join(' ');
    
    instance.options.specFileList = instance.renderFileList();
    
    async.series([
        function (callback) {
            instance.renderSpecFile(callback);
        }, function (callback) {
            // gutil.log('Running: `'+ command +'` in: '+ instance.buildRoot_SPECS);
            exec(command, { cwd: instance.buildRoot_SPECS }, callback);
        }
    ], callback);
}

function renderFileList(instance) {
    var f, attr;
    
    return instance.fileList.map(function (file) {
        f = [];
        
        if (file.type == 'config') {
            f.push('%config'+ (file.noreplace ? '(noreplace)' : ''));
        }
        
        if (file.attr) {
            attr = file.attr;
            attr = attr.map(function (i) { return i || '-'; });
            attr.unshift('%attr(%s, %s, %s)');
            attr = util.format.apply(null, attr);
            f.push(attr);
        }
        
        f.push('/'+ file.relative);
        
        return f.join(' ');
    }).join('\n');
    
    return out.join('\n');
}

function renderSpecFile(instance, callback) {
    var spec;
    async.series([
        function (callback) {
            fs.readFile(path.join(__dirname, 'assets/spec'), 'utf8', function (error, file) {
                spec = ld.template(file, instance.options, { variable: 'data' });
                callback(null);
            });
        }, function (callback) {
            fs.writeFile(path.join(instance.buildDir_SPECS, 'spec'), spec, callback);
        }
    ], callback);
}
