/* eslint-disable */
const defaultConfig = require('tailwindcss/defaultConfig')();

module.exports = {
    ...defaultConfig,

    plugins: [
        ...defaultConfig.plugins,

        // Aspect-ratios
        // https://www.npmjs.com/package/tailwindcss-aspect-ratio
        require('tailwindcss-aspect-ratio')({
            ratios: {
                square: [1, 1],
                short: [2, 1],
                tall: [1, 2],
                widescreen: [16, 9],
            },
        }),
        // Transitions
        // https://www.npmjs.com/package/tailwindcss-transition
        require('tailwindcss-transition')({
            standard: 'all .2s ease',
            transitions: {
                none: 'none',
                slow: 'all .8s ease',
                medium: 'all .4s ease',
                fast: 'all .2s ease',
            },
        }),
    ],
};
