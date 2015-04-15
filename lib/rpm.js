var ld = require('lodash');
var fs = require('graceful-fs');
var path = require('path');
var util = require('util');
var spawn = require('child_process').spawn;
var async = require('async');
var gutil = require('gulp-util');
var mkdirp = require('mkdirp');
var butil = require('./util');

var $rpm = {};

$rpm.setup = function $setup(callback) {
    return setup(this, callback);
};

$rpm.setupTask = function $setupTask() {
    return $rpm.setup.bind(this);
};

$rpm.files = function $files() {
    return files(this);
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

function create(brass, options) {
    var rpm, defaults;
    
    defaults = {
        release: 1,
        prefix: '/usr'
    };
    
    rpm = Object.create($rpm);
    rpm.brass = brass;
    rpm.options = ld.assign({}, defaults, options || {});
    rpm.buildDir = options.buildDir;
    rpm.buildRoot = null;
    rpm.fileList = [];
    rpm.specFileList = null;
    
    [ 'BUILD', 'RPMS', 'SOURCES', 'SPECS', 'SRPMS' ].map(function (dir) {
        rpm['buildDir_'+ dir] = path.join(rpm.buildDir, dir);
    });
    
    rpm.globOptions = {
        mark: true,
        cwd: rpm.buildDir_BUILD,
        base: rpm.buildDir_BUILD
    };
    
    return rpm;
}

function setup(instance, callback) {
    var fullpath;
    
    async.series([
        function (callback) {
            fullpath = path.join(instance.buildDir, 'tmp');
            instance.buildRoot = fullpath;
            
            mkdirp(fullpath, callback);
        }, function (callback) {
            async.eachSeries([
                instance.buildDir_BUILD,
                instance.buildDir_RPMS,
                instance.buildDir_SOURCES,
                instance.buildDir_SPECS,
                instance.buildDir_SRPMS
            ], mkdirp, callback);
        }
    ], callback);
}

function files(instance) {
    return butil.stream(function (file, callback) {
        file.base = instance.buildRoot;
        instance.fileList.push(file);
        callback(null, file);
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
    return butil.stream(function (file, callback) {
        var command, proc;
        
        this.push(file);
        
        command = [
            'rpmbuild',
            '-ba',
            '--quiet',
            '--buildroot', instance.buildRoot,
            file.relative
        ];
        
        proc = spawn(command.shift(), command, { cwd: instance.buildDir_SPECS });
        proc.on('exit', function (code, signal) {
            var error = 'rpmbuild process';
            if (code != 0) {
                if (signal) {
                    error += ' received signal '+ signal +' and'
                }
                error += ' exited with return code '+ code;
                callback(butil.error(error));
            }
        });
        proc.on('error', function (error) {
            callback(butil.error(error));
        });
        proc.stderr.on('data', function (error) {
            gutil.log(butil.error(error));
        });
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
        
        if (file.stat && file.stat.isDirectory()) {
            f.push('%dir');
        }
        
        if (file.config) {
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
}
