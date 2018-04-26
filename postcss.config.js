module.exports = {
    ident: 'postcss',
    plugins: [
        require('tailwindcss')('./tailwind.config.js'),
        require('postcss-nested'),
        require('postcss-flexbugs-fixes'),
        require('autoprefixer')({
            browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9'],
            flexbox: 'no-2009',
        }),
    ],
};
