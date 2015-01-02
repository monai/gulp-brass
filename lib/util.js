var path = require('path');

module.exports = {
    assets: assets
};

function assets(filename) {
    return path.resolve(__dirname, '../assets', filename);
}
