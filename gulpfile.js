var gulp = require('gulp');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var es = require('event-stream');
var symlink = require('gulp-symlink');

gulp.task('clean', function () {
    return gulp.src('tmp', { read: false })
    .pipe(es.map(function (file, callback) {
        rimraf(file.path, callback);
    }));
});

gulp.task('setup', [ 'clean' ], function () {
     return es.readArray([ 'tmp' ])
    .pipe(es.map(function (file, callback) {
        mkdirp(file, callback);
    }));
});

gulp.task('copy-files', [ 'setup' ], function () {
    return gulp.src([
        'package/*',
        'package/bin/**/*',
        'package/assets/**/*',
        'package/node_modules/**/*',
        '!package/config',
        '!package/var',
    ], { mark: true, base: 'package' })
    .pipe(gulp.dest('tmp/usr/lib/theapp'));
});

gulp.task('binaries', [ 'setup', 'copy-files' ], function () {
    return gulp.src('tmp/usr/lib/theapp/bin/theapp', { read: false })
    .pipe(symlink('tmp/bin/theapp', { force: true }));
});

gulp.task('foo', [ 'setup', 'copy-files', 'binaries' ], function () {
    console.log('foo');
});

gulp.task('default', [ 'foo' ]);
