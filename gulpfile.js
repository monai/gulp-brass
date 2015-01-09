var gulp = require('gulp');
var path = require('path');
var util = require('util');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var through = require('through2');
var brass = require('./index');

var options = {
    type: 'rpm',
    workDir: '.',
    name: 'theapp',
    version: '0.0.1',
    license: 'ISC',
    summary: 'The App',
    description: 'This is the application'
};

options.service = {
    type: 'systemd',
    name: options.name,
    description: options.description,
    target: '/usr/lib/theapp/bin/theapp',
    user: 'vagrant',
    group: 'vagrant'
};

var rpm = brass.create(options);

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

gulp.task('rpm-binaries', [ 'rpm-files' ], function () {
    return gulp.src(path.join(rpm.buildRoot, '/usr/lib/theapp/bin/theapp'))
    .pipe(brass.util.symlink([
        path.join(rpm.buildRoot, '/usr/bin/theapp'),
        path.join(rpm.buildRoot, '/usr/sbin/theapp')
    ]))
    .pipe(rpm.files())
    .pipe(through.obj(function (file, enc, callback) {
        console.log(file.path);
        console.log(rpm.options.specFileList);
        callback(null, file);
    }));
});

gulp.task('rpm-service', [ 'rpm-setup' ], function () {
    return gulp.src(brass.util.assets('service/systemd'))
    .pipe(brass.util.template(options.service))
    .pipe(brass.util.rename(options.service.name +'.service'))
    .pipe(gulp.dest(path.join(rpm.buildRoot, '/lib/systemd/system')))
    .pipe(rpm.files());
});

// gulp.task('rpm-spec', [ 'rpm-files' ], function () {
//     return gulp.src(brass.util.assets('rpm/spec'))
//     .pipe(rpm.spec())
//     .pipe(gulp.dest(rpm.buildDir_SPECS));
// });

gulp.task('rpm-spec', [ 'rpm-files' ], rpm.specTask());
 
// gulp.task('rpm-build', [ 'rpm-setup', 'rpm-files', 'rpm-spec' ], function () {
//     return gulp.src(path.join(rpm.buildDir_SPECS, '*'), { read: false })
//     .pipe(rpm.build());
// });

gulp.task('rpm-build', [ 'rpm-setup', 'rpm-files', 'rpm-binaries', 'rpm-service', 'rpm-spec' ], rpm.buildTask());

gulp.task('build', [ 'rpm-build' ], function () {
    console.log('build finished');
});

gulp.task('default', [ 'build' ]);
