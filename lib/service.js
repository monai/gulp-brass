var dz = require('dezalgo');
var ld = require('lodash');
var through = require('through2');

var $service = {};

$service.file = function $file() {
    return file(this);
};

module.exports = {
    create: create
};

function create(packager, options) {
    var service;
    
    service = Object.create($service);
    service.options = ld.assign({}, packager.options || {});
    service.options.service = options || {};
    
    return service;
}

function file(instance) {
    return through.obj(function (file, enc, callback) {
        var contents;
        contents = file.contents.toString();
        contents = ld.template(contents, instance.options, { variable: 'data' });
        file.contents = new Buffer(contents);
        dz(callback)(null, file);
    });
}
