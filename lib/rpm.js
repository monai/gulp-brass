var ld = require('lodash');
var dz = require('dezalgo');
var fs = require('graceful-fs');
var path = require('path');
var exec = require('child_process').exec;
var async = require('async');
var gutil = require('gulp-util');
var mkdirp = require('mkdirp');
var through = require('through2');
var butil = require('./util');

var $rpm = {};

$rpm.setup = function $setup(callback) {
    return setup(this, dz(callback));
};

$rpm.setupTask = function $setupTask() {
    return $rpm.setup.bind(this);
};

$rpm.files = function $files(options) {
    return files(this, options);
};

$rpm.spec = function $spec() {
    return spec(this);
};

$rpm.specTask = function $specTask() {
    var $this = this;
    return function $specTask_() {
        return specTask($this, this);
    };
};

$rpm.build = function $build(callback) {
    return build(this);
};

$rpm.buildTask = function $buildTask() {
    var $this = this;
    return function $buildTask_() {
        return buildTask($this, this);
    };
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
    var rpm, defaults;
    
    defaults = {
        release: 1,
        group: 'Applications/Internet',
    };
    
    rpm = Object.create($rpm);
    rpm.options = ld.assign({}, defaults, options);
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

function spec(instance) {
    instance.options.specFileList = instance.renderFileList();
    return butil.template(instance.options);
}

function specTask(instance, gulp) {
    return gulp.src(butil.assets('rpm/spec'))
    .pipe(instance.spec())
    .pipe(gulp.dest(instance.buildDir_SPECS));
}

function build(instance) {
    return through.obj(function (file, enc, callback) {
        var command;
        
        this.push(file);
        // gutil.log('Building package', { em: true });
        
        command = ([
            'rpmbuild',
            '-ba',
            '--buildroot', instance.buildRoot,
            file.relative
        ]).join(' ');
        
        exec(command, { cwd: instance.buildRoot_SPECS }, callback);
    });
}

function buildTask(instance, gulp) {
    return gulp.src(path.join(instance.buildDir_SPECS, '*'), { read: false })
    .pipe(instance.build());
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
