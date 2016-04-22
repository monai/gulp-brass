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
    var cwd, workDir, buildDir, packager;

    options = options || {};

    cwd = process.cwd();
    workDir = options.workDir || cwd;
    buildDir = options.buildDir || path.resolve(cwd, path.join(workDir, BUILD_DIR_NAME));

    options.cwd = cwd;
    options.workDir = workDir;
    options.buildDir = buildDir;
    options.type = options.type || RPM;

    packager = null;
    if (options.type == RPM) {
        packager = rpm.create(brass, options);
    } else if (options.type == DEB) {
        // packager = deb.create(brass, options);
    }

    return packager;
}
