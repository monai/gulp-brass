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
};

$rpm.asset = function $asset(filename) {
    return asset(this, filename);
};

$rpm.spec = function $spec() {
    return spec(this);
};

$rpm.build = function $build(callback) {
    build(this, dz(callback));
};

$rpm.buildTask = function $buildTask() {
    return $rpm.build.bind(this);
};

$rpm.renderFileList = function $renderFileList() {
    return renderFileList(this);
};

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

function asset(instance, filename) {
    return path.resolve(__dirname, '../assets', filename);
}

function spec(instance) {
    instance.options.specFileList = instance.renderFileList();
    return through.obj(function (file, enc, callback) {
        var contents;
        contents = file.contents.toString();
        contents = ld.template(contents, instance.options, { variable: 'data' });
        file.contents = new Buffer(contents);
        dz(callback)(null, file);
    });
}

function build(instance, callback) {
    var command;
    
    console.log(callback);
    
    // gutil.log('Building package', { em: true });
    
    command = ([
        'rpmbuild',
        '-ba',
        '--buildroot', instance.buildRoot,
        'spec'
    ]).join(' ');
    
    exec(command, { cwd: instance.buildRoot_SPECS }, callback);
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
