# gulp-brass

[![Build Status](http://img.shields.io/travis/monai/gulp-brass/develop.svg)](https://travis-ci.org/monai/gulp-brass)
[![NPM Version](http://img.shields.io/npm/v/gulp-brass.svg)](https://www.npmjs.org/package/gulp-brass)

Build RPM package.

## How to use

Check out self explanatory [example](/examples/theapp/gulpfile.js).

##RPM

```js
var rpm = brass.create(options);
```

### Tasks

#### rpm.setupTask()

A shorthand for `rpm.setup()` stream. Use this.

#### rpm.specTask()

A shorthand for `rpm.spec()` stream.

#### rpm.buildTask()

Runs `rpmbuild` against all spec files in `rpm.buildDir_SPECS` directory.

### Streams

#### rpm.setup()

Creates directory structure required by `rpmbuild`. Use `rpm.setupTask()` task instead.

#### rpm.files(options)

It registers files and aplies options which will be inlined in spec file. All packaged files must be piped to this stream. Always pipe after `gulp.dest()`.

Options:

```js
{
    user: 'root',
    group: 'root',
    mode: '0644',
    config: false,
    noreplace: false
}
```

All options are optional.

#### rpm.spec()

Renders default spec file. Populates `rpm.options` with `rpm.renderFileList()` output.

#### rpm.build()

Runs `rpmbuild` against piped spec files.

### Methods

#### rpm.renderFileList()

Returns registered files list with inlined attributes as string to be used in `%files` section in spec file.
