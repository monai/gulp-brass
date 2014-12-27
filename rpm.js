var dz = require('dezalgo');
var path = require('path');
var async = require('async');
var mkdirp = require('mkdirp');
var gutil = require('gulp-util');

var $rpm = {};

$rpm.setup = function $setup(callback) {
    setup(this, dz(callback));
};

$rpm.setupTask = function $setupTask() {
    return $rpm.setup.bind(this);
};

module.exports = {
    create: create
};

function create(options) {
    var rpm;
    
    rpm = Object.create($rpm);
    rpm.options = options;
    
    return rpm;
}

function setup(instance, callback) {
    var fullpath;
    
    gutil.log('Preapring build directories', { em: true });
    
    async.series([
        function (callback) {
            fullpath = path.join(instance.options.BUILD_DIR, 'tmp');
            instance.options.BUILDROOT_DIR = fullpath;
            
            gutil.log('Creating directory: '+ fullpath);
            
            mkdirp(fullpath, callback);
        }, function (callback) {
            async.eachSeries([ 'BUILD', 'RPMS', 'SOURCES', 'SPECS', 'SRPMS' ], function (dir, callback) {
                fullpath = path.join(instance.options.BUILD_DIR, dir);
                instance.options['BUILDROOT_'+ dir] = fullpath;
                
                gutil.log('Creating directory: '+ fullpath);
                
                mkdirp(fullpath, callback);
            }, callback);
        }
    ], callback);
}

function dest(instace, target) {
    
}
