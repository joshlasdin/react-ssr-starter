// We don't use ES6 import/export in this file so the babel plugin can
// parse it correctly
const sass = require('node-sass');

module.exports = function processSass(data, file) {
    const { css } = sass.renderSync({ data, file });
    return css.toString('utf8');
};
