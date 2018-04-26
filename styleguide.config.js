const path = require('path');
const set = require('lodash/set');
const webpackConfig = require('./webpack.config.prod');

module.exports = {
    components: 'src/**/*.js',
    pagePerSection: true,
    serverPort: process.env.PORT ? Number(process.env.PORT) : 6060,
    showCode: false,
    showUsage: true,
    skipComponentsWithoutExample: true,
    webpackConfig,

    editorConfig: {
        theme: 'seti',
    },

    dangerouslyUpdateWebpackConfig(config, env) {
        // Some simple dev options
        if (env === 'development') {
            set(config, 'mode', 'development');
            set(config, 'devServer.disableHostCheck', true);
        }

        // Ensure global styles are added
        config.entry.push(path.join(__dirname, 'src/style/global.scss'));

        return config;
    },
};
