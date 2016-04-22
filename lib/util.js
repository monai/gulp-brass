var fs = require('graceful-fs');
var path = require('path');
var async = require('async');
var gutil = require('gulp-util');
var mkdirp = require('mkdirp');
var Transform = require('stream').Transform;
var handlebars = require('handlebars');

module.exports = {
    assets: assets,
    stream: stream,
    template: template,
    rename: rename,
    symlink: symlink,
    error: error
};

handlebars.registerHelper('equal', require('handlebars-helper-equal'));

function assets(filename) {
    return path.resolve(__dirname, '../assets', filename);
}

function stream(callback, flush) {
    var stream;

    stream =  new Transform({ objectMode: true });
    stream._transform = _transform;
    if (flush) {
        stream._flush = _flush;
    }
    return stream;

    function _transform(chunk, enc, done) {
        /*jshint validthis: true */
        return callback.call(this, chunk, done);
    }

    function _flush(done) {
        /*jshint validthis: true */
        return flush.call(this, done);
    }
}

function template(data) {
    return stream(function (file, callback) {
        var contents;
        contents = file.contents.toString();
        contents = handlebars.compile(contents)(data);
        file.contents = new Buffer(contents);
        callback(null, file);
    });
}

function rename(name) {
    return stream(function (file, callback) {
        file.path = path.resolve(file.base, name);
        callback(null, file);
    });
}

function symlink(name, options) {
    name = Array.isArray(name) ? name : [name];
    options = options || {};

    return stream(function (file, done) {
        var $this = this;

        if (options.deep) {
            async.each(name, ln, done);
        } else {
            ln(name.shift(), done);
        }

        function ln(name, callback) {
            var base, target;

            base = path.dirname(name);
            target = path.relative(base, file.path);

            async.series([
                async.apply(mkdirp, path.dirname(name)),
                async.apply(fs.symlink, target, name),
                function (next) {
                    var file_ = new gutil.File({
                        cwd: file.cwd,
                        base: base,
                        path: name,
                        contents: file.contents
                    });
                    $this.push(file_);
                    next();
                }
            ], function (error) {
                callback(error);
            });
        }
    });
}

function error(error) {
    return new gutil.PluginError('gulp-brass', error.toString());
}
