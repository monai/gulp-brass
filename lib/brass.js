var os = require('os');
var ld = require('lodash');
var path = require('path');
var rpm = require('./rpm');
var butil = require('./util');

var RPM = 'rpm';
var DEB = 'deb';
var BUILD_DIR_NAME = 'brass_build';

var brass = {
    RPM: RPM,
    DEB: DEB,
    create: create,
    rpm: rpm,
    util: butil,
};

module.exports = brass;

function create(options) {
    var cwd, workDir, packager;
    
    options = options || {};
    
    cwd = process.cwd();
    workDir = options.workDir || os.tmpdir();
    options.cwd = cwd;
    options.workDir = workDir;
    options.buildDir = path.resolve(cwd, path.join(workDir, BUILD_DIR_NAME));
    
    packager = null;
    if (options.type == RPM) {
        packager = rpm.create(brass, options);
    } else if (options.type == DEB) {
        // packager = deb.create(brass, options);
    }
    
    return packager;
}
