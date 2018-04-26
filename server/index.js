global.fetch = require('node-fetch');

require('babel-register')({
    presets: ['react', 'env', 'stage-2'],
    plugins: [
        'babel-plugin-transform-decorators',
        'transform-assets',
        [
            'css-modules-transform',
            {
                generateScopedName: '[local]-[hash:8]',
                preprocessCss: './server/sass-processor',
                extensions: ['.css', '.scss'],
            },
        ],
    ],
});
require('babel-polyfill');

const app = require('./server');

module.exports = app;
