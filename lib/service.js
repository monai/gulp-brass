var dz = require('dezalgo');
var ld = require('lodash');
var through = require('through2');
var handlebars = require('handlebars');

var $service = {};

$service.file = function $file() {
    return file(this);
};

module.exports = {
    create: create
};

function create(options) {
    var service;
    
    service = Object.create($service);
    service.options = options || {};
    
    return service;
}

function file(instance) {
    return through.obj(function (file, enc, callback) {
        var contents;
        contents = file.contents.toString();
        contents = handlebars.compile(contents)(instance.options);
        file.contents = new Buffer(contents);
        dz(callback)(null, file);
    });
}
