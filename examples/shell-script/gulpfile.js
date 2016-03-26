var path   = require('path');
var gulp   = require('gulp');
var rimraf = require('rimraf');
var brass  = require('../../index');

var options = {
  name        : 'shell-script',
  version     : '1.0.0',
  license     : 'ISC',
  summary     : 'A simple shell script',
  description : 'The script print "this is shell script"'
};

var rpm = brass.create(options);

gulp.task('clean', function (done) {
  rimraf(rpm.buildDir, done);
});

gulp.task('setup', [ 'clean' ], rpm.setupTask());

gulp.task('files', [ 'setup' ], function () {
  var globs = [
    'thescript.sh'
  ];

  return gulp.src(globs)
  .pipe(gulp.dest(path.join(rpm.buildRoot, '/usr/bin')))
  .pipe(brass.util.stream(function (file, done) {
    file.attr = [ '0775', 'root', 'root' ];
    done(null, file);
  }))
  .pipe(rpm.files());
});

gulp.task('spec', [ 'files' ], rpm.specTask());
gulp.task('build', [ 'spec' ], rpm.buildTask());

gulp.task('default', [ 'build' ], function () {
  console.log('build finished');
});
