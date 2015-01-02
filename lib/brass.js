var os = require('os');
var ld = require('lodash');
var path = require('path');
var rpm = require('./rpm');

var RPM = 'rpm';
var DEB = 'deb';
var BUILD_DIR_NAME = 'brass_build';

module.exports = {
    RPM: RPM,
    DEB: DEB,
    create: create,
    rpm: rpm,
    assets: assets
};

function create(type, options) {
    var cwd, workDir;
    
    options = options || {};
    
    cwd = process.cwd();
    workDir = options.workDir || os.tmpdir();
    options.workDir = workDir;
    options.buildDir = path.resolve(cwd, path.join(workDir, BUILD_DIR_NAME));
    
    if (type == RPM) {
        return rpm.create(options);
    } else if (type == DEB) {
        return null;
        // brass = deb.create(brass, options);
    }
    
    return null;
}

function assets(filename) {
    return path.resolve(__dirname, '../assets', filename);
}
