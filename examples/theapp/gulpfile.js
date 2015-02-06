var gulp = require('gulp');
var path = require('path');
var exec = require('child_process').exec;
var async = require('async');
var rimraf = require('rimraf');
var brass = require('../../index');

var options = {
    type: 'rpm',
    workDir: '.',
    name: 'theapp',
    version: '0.0.0',
    license: 'ISC',
    summary: 'The App',
    description: 'This is the application'
};

options.service = {
    type: 'systemd',
    name: options.name,
    description: options.description,
    exec: '/usr/bin/theapp',
    user: 'vagrant',
    group: 'vagrant'
};

var rpm = brass.create(options);

gulp.task('clean', function (callback) {
    rimraf(rpm.buildDir, callback);
});

gulp.task('rpm-setup', [ 'clean' ], rpm.setupTask());

gulp.task('npm-pack', [ 'rpm-setup' ], function (callback) {
    var cwd = process.cwd();
    async.series([
        function (callback) {
            exec('npm pack '+ cwd, { cwd: rpm.buildDir_SOURCES }, callback);
        }, function (callback) {
            var archive;
            
            archive = options.name +'-'+ options.version +'.tgz';
            archive = path.join(rpm.buildDir_SOURCES, archive);
            
            exec('tar xvzf '+ archive, { cwd: rpm.buildDir_BUILD }, callback);
        }, function (callback) {
            process.env['NODE_ENV'] = 'production';
            exec('npm install', {
                env: process.env,
                cwd: path.join(rpm.buildDir_BUILD, 'package')
            }, callback);
        }
    ], callback);
});

gulp.task('rpm-files', [ 'rpm-setup', 'npm-pack' ], function () {
    var globs = brass.util.prefix([
        'package/*',
        'package/bin/**/*',
        'package/assets/**/*',
        'package/node_modules/**/*',
        '!pacakge/config',
        '!pacakge/var',
    ], rpm.buildDir_BUILD);
    
    return gulp.src(globs, { mark: true, base: rpm.buildDir_BUILD })
    .pipe(gulp.dest(path.join(rpm.buildRoot, '/usr/lib/theapp')))
    .pipe(rpm.files());
});

gulp.task('rpm-service', [ 'rpm-setup' ], function () {
    return gulp.src(brass.util.assets('service/systemd'))
    .pipe(brass.util.template(options.service))
    .pipe(brass.util.rename(options.service.name +'.service'))
    .pipe(gulp.dest(path.join(rpm.buildRoot, '/lib/systemd/system')))
    .pipe(rpm.files());
});

gulp.task('rpm-binaries', [ 'rpm-files' ], function () {
    return gulp.src(path.join(rpm.buildRoot, '/usr/lib/theapp/bin/theapp'))
    .pipe(brass.util.symlink([
        path.join(rpm.buildRoot, '/usr/sbin/theapp')
    ]))
    .pipe(rpm.files());
});

// gulp.task('rpm-spec', [ 'rpm-files' ], function () {
//     return gulp.src(brass.util.assets('rpm/spec'))
//     .pipe(rpm.spec())
//     .pipe(gulp.dest(rpm.buildDir_SPECS));
// });

gulp.task('rpm-spec', [ 'rpm-files', 'rpm-binaries' ], rpm.specTask());
 
// gulp.task('rpm-build', [ 'rpm-setup', 'rpm-files', 'rpm-spec' ], function () {
//     return gulp.src(path.join(rpm.buildDir_SPECS, '*'), { read: false })
//     .pipe(rpm.build());
// });

gulp.task('rpm-build', [ 'rpm-setup', 'npm-pack', 'rpm-files', 'rpm-binaries', 'rpm-service', 'rpm-spec' ], rpm.buildTask());

gulp.task('build', [ 'rpm-build' ], function () {
    console.log('build finished');
});

gulp.task('default', [ 'build' ]);
