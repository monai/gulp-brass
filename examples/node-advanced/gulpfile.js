var path   = require('path');
var gulp   = require('gulp');
var rimraf = require('rimraf');
var npm    = require('gulp-brass-npm');
var brass  = require('../../index');

var pkg, options, rpm;

pkg = require('./package.json');
options = npm.getOptions(pkg);
options.installDir = '/usr/lib/'+ options.name;
options.service = {
  type        : 'systemd',
  name        : options.name,
  description : options.description,
  exec        : '/usr/bin/node-advanced',
  user        : 'node', // will be allocated dynamically
  group       : 'node'  // will be allocated dynamically
};
rpm = brass.create(options);

gulp.task('clean', function () {
  return gulp.src([ rpm.buildDir, '*.tgz', '*.log' ], { read: false })
  .pipe(brass.util.stream(function (file, done) {
    this.push(file);
    rimraf(file.path, done);
  }));
});

gulp.task('setup', [ 'clean' ], rpm.setupTask());
gulp.task('source', [ 'setup' ], npm.sourceTask(pkg, rpm));

gulp.task('files', [ 'setup', 'source' ], function () {
  var globs = [
    '**/*'
  ];

  return gulp.src(globs, rpm.globOptions)
  .pipe(gulp.dest(path.join(rpm.buildRoot, options.installDir)))
  .pipe(brass.util.stream(function (file, done) {
    if (file.relative == 'bin/node-advanced') {
      file.attr = [ '0775', 'root', 'root' ];
    }

    done(null, file);
  }))
  .pipe(rpm.files());
});

// Customize systemd service unit file.
gulp.task('service', [ 'setup' ], function () {
    return gulp.src('assets/unit.service')
    .pipe(brass.util.template(options.service))
    .pipe(brass.util.rename(options.service.name +'.service'))
    .pipe(gulp.dest(path.join(rpm.buildRoot, '/lib/systemd/system')))
    .pipe(rpm.files());
});


gulp.task('binaries', [ 'files' ], npm.binariesTask(pkg, rpm));

// Customize spec file to dynamically allocate user.
// See more: https://fedoraproject.org/wiki/Packaging:UsersAndGroups
gulp.task('spec', [ 'files', 'binaries', 'service' ], function () {
    return gulp.src('assets/spec')
    .pipe(rpm.spec())
    .pipe(gulp.dest(rpm.buildDir_SPECS));
});

gulp.task('build', [ 'spec' ], rpm.buildTask());

gulp.task('default', [ 'build' ], function () {
  console.log('build finished');
});
