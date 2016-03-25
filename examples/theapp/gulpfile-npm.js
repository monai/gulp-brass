var gulp = require('gulp');
var path = require('path');
var exec = require('child_process').exec;
var rimraf = require('rimraf');
var brass = require('../../index');
var npm = require('gulp-brass-npm');

var pkg, options, rpm;

pkg = require('./package.json');
options = npm.getOptions(pkg);
options.installDir = '/usr/lib/'+ options.name;
options.service = {
    type: 'systemd',
    name: options.name,
    description: options.description,
    exec: '/usr/bin/theapp',
    user: 'vagrant',
    group: 'vagrant'
};
rpm = brass.create(options);

gulp.task('clean', function () {
    return gulp.src([ rpm.buildDir, '*.tgz' ], { read: false })
    .pipe(brass.util.stream(function (file, callback) {
        this.push(file);
        rimraf(file.path, callback);
    }));
});

gulp.task('setup', [ 'clean' ], rpm.setupTask());
gulp.task('source', [ 'setup' ], npm.sourceTask(pkg, rpm));

gulp.task('files', [ 'setup', 'source' ], function () {
    var globs = [
        '*',
        'bin/**/*',
        'assets/**/*',
        'node_modules/**/*',
        '!config',
        '!var',
    ];

    return gulp.src(globs, rpm.globOptions)
    .pipe(gulp.dest(path.join(rpm.buildRoot, options.installDir)))
    .pipe(rpm.files());
});

gulp.task('service', [ 'setup' ], npm.serviceTask(rpm));
gulp.task('binaries', [ 'files' ], npm.binariesTask(pkg, rpm));
gulp.task('spec', [ 'files', 'binaries' ], rpm.specTask());
gulp.task('build', [ 'setup', 'source', 'files', 'binaries', 'service', 'spec' ], rpm.buildTask());

gulp.task('default', [ 'build' ], function () {
    console.log('build finished');
});
