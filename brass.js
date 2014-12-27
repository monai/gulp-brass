var os = require('os');
var ld = require('lodash');
var path = require('path');
var rpm = require('./rpm');

var RPM = 'rpm';
var DEB = 'deb';
var BUILDDIR_NAME = 'brass_build';

module.exports = {
    RPM: RPM,
    DEB: DEB,
    create: create
};

function create(type, options) {
    var cwd, workDir;
    
    options = options || {};
    
    cwd = process.cwd();
    workDir = options.workDir || os.tmpdir();
    workDir = path.resolve(cwd, path.join(workDir, BUILDDIR_NAME));
    options.workDir = workDir;
    
    if (type == RPM) {
        return rpm.create(options);
    } else if (type == DEB) {
        return null;
        // brass = deb.create(brass, options);
    }
    
    return null;
}
