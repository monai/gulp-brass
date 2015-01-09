var ld = require('lodash');
var dz = require('dezalgo')
var fs = require('graceful-fs');;
var path = require('path');
var async = require('async');
var gutil = require('gulp-util');
var mkdirp = require('mkdirp');
var through = require('through2');
var handlebars = require('handlebars');

module.exports = {
    assets: assets,
    template: template,
    rename: rename,
    symlink: symlink
};

handlebars.registerHelper('equal', require('handlebars-helper-equal'));

function assets(filename) {
    return path.resolve(__dirname, '../assets', filename);
}

function template(data) {
    return through.obj(function (file, enc, callback) {
        var contents;
        contents = file.contents.toString();
        contents = handlebars.compile(contents)(data);
        file.contents = new Buffer(contents);
        dz(callback)(null, file);
    });
}

function rename(name) {
    return through.obj(function (file, enc, callback) {
        file.path = path.resolve(file.base, name);
        dz(callback)(null, file);
    });
}

function symlink(name) {
    name = ld.isArray(name) ? name : [name];
    return through.obj(function (file, enc, callback) {
        var $this = this;
        async.each(name, function (name, callback) {
            var base, target;
            
            base = path.dirname(name);
            target = path.relative(base, file.path);
            
            async.series([
                function (callback) {
                    mkdirp(path.dirname(name), callback);
                }, function (callback) {
                    fs.symlink(target, name, callback);
                }, function (callback) {
                    $this.push(new gutil.File({
                        cwd: file.cwd,
                        base: base,
                        path: name,
                        contents: file.contents
                    }));
                    dz(callback)(null);
                }
            ], dz(callback));
        }, dz(callback));
    });
}
