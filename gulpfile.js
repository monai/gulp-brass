var gulp = require('gulp');
var path = require('path');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var symlink = require('gulp-symlink');
var through = require('through2');
var brass = require('./index');
var util = require('util');

var rpm = brass.create(brass.RPM, {
    workDir: '.',
    name: 'theapp',
    version: '0.0.1',
    release: 1,
    license: 'ISC',
    group: 'Applications/Internet',
    source: 'theapp-0.0.1.tgz',
    summary: 'The App',
    description: 'This is the application'
});

gulp.task('clean', function () {
    return gulp.src(rpm.buildDir, { read: false })
    .pipe(through.obj(function (file, enc, callback) {
        this.push(file);
        rimraf(file.path, callback);
    }));
});

gulp.task('rpm-setup', [  'clean' ], rpm.setupTask());

gulp.task('rpm-files', [ 'rpm-setup' ], function () {
    return gulp.src([
        'package/*',
        'package/bin/**/*',
        'package/assets/**/*',
        'package/node_modules/**/*',
        '!package/config',
        '!package/var',
    ], { mark: true, base: 'package' })
    .pipe(gulp.dest(path.join(rpm.buildRoot, '/usr/lib/theapp')))
    .pipe(rpm.files());
});

gulp.task('rpm-spec', [ 'rpm-files' ], function () {
    return gulp.src(rpm.asset('rpm/spec'))
    .pipe(rpm.spec())
    .pipe(gulp.dest(rpm.buildDir_SPECS));
});

gulp.task('rpm-build', [ 'rpm-setup', 'rpm-files', 'rpm-spec' ], rpm.buildTask());

gulp.task('build', [ 'rpm-setup', 'rpm-files', 'rpm-spec', 'rpm-build' ], function () {
    console.log('build finished');
});

gulp.task('default', [ 'build' ]);
