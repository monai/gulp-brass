var gulp = require('gulp');
var path = require('path');
var exec = require('child_process').exec;
var async = require('async');
var assign = require('lodash.assign');
var rimraf = require('rimraf');
var through = require('through2');
var brass = require('../../index');
var npm = require('gulp-brass-npm');

var pkg, options, rpm;

pkg = require('./package.json');
options = npm.getOptions(pkg);
options.type = 'rpm';
options.workDir = '.';
options.target = '/usr/lib/'+ options.name;
options.service = {
    type: 'systemd',
    name: options.name,
    description: options.description,
    target: options.target +'/bin/theapp',
    user: 'vagrant',
    group: 'vagrant'
};
rpm = brass.create(options);

gulp.task('clean', function () {
    return gulp.src([ rpm.buildDir, '*.tgz' ], { read: false })
    .pipe(through.obj(function (file, enc, callback) {
        this.push(file);
        rimraf(file.path, callback);
    }));
});

gulp.task('setup', [ 'clean' ], rpm.setupTask());
gulp.task('source', [ 'setup' ], npm.sourceTask(pkg, rpm));

gulp.task('files', [ 'setup', 'source' ], function () {
    var globs = brass.util.prefix([
        '*',
        'bin/**/*',
        'assets/**/*',
        'node_modules/**/*',
        '!config',
        '!var',
    ], rpm.buildDir_BUILD);
    
    return gulp.src(globs, { mark: true, base: rpm.buildDir_BUILD })
    .pipe(gulp.dest(path.join(rpm.buildRoot, options.target)))
    .pipe(rpm.files());
});

gulp.task('service', [ 'setup' ], npm.serviceTask(rpm));
gulp.task('binaries', [ 'files' ], npm.binariesTask(pkg, rpm));
gulp.task('spec', [ 'files', 'binaries' ], rpm.specTask());
gulp.task('build', [ 'setup', 'source', 'files', 'binaries', 'service', 'spec' ], rpm.buildTask());

gulp.task('default', [ 'build' ], function () {
    console.log('build finished');
});
