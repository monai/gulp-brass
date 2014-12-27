var dz = require('dezalgo');

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
    console.log('ok');
    
    callback();
}

function dest(instace, target) {
    
}

