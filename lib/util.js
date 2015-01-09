var dz = require('dezalgo');
var path = require('path');
var through = require('through2');
var handlebars = require('handlebars');

module.exports = {
    assets: assets,
    template: template,
    rename: rename
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
