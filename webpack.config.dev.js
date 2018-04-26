const path = require('path');
const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const FormatMessagesWebpackPlugin = require('format-messages-webpack-plugin');

const makePath = x => path.resolve(__dirname, x);

const paths = {
    // Paths
    static: 'static',
    public: '/',

    // Directories
    buildDirectory: makePath('build'),
    srcDirectory: makePath('src'),
    docsDirectory: makePath('docs'),
    testDirectory: makePath('test'),

    // Files
    entryFile: makePath('src/index.js'),
    packageFile: makePath('package.json'),
};

if (!process.env.NODE_ENV) {
    throw new Error('process.env.NODE_ENV must be set.');
}

// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
module.exports = {
    // You may want 'eval' instead if you prefer to see the compiled output in DevTools.
    // See the discussion in https://github.com/facebookincubator/create-react-app/issues/343.
    devtool: 'cheap-module-source-map',

    // New flag in webpack v4 to flag for minification
    // https://medium.com/webpack/webpack-4-mode-and-optimization-5423a6bc597a
    mode: 'development',

    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    // The first two entry points enable "hot" CSS and auto-refreshes for JS.
    entry: {
        app: [
            require.resolve('babel-polyfill'),

            // Required to handle hot module reloads
            'react-hot-loader/patch',
            'webpack-hot-middleware/client?quiet=true',

            // Finally, this is your app's code:
            // We include the app code last so that if there is a runtime error during
            // initialization, it doesn't blow up the WebpackDevServer client, and
            // changing JS code would still trigger a refresh.
            paths.entryFile,
        ],
    },

    output: {
        // The build folder.
        path: paths.buildDirectory,

        // Add /* filename */ comments to generated require()s in the output.
        pathinfo: true,

        // This does not produce a real file. It's just the virtual path that is
        // served by WebpackDevServer in development. This is the JS bundle
        // containing code from all our entry points, and the Webpack runtime.
        filename: `${paths.static}/js/bundle.js`,

        // There are also additional JS chunk files if you use code splitting.
        chunkFilename: `${paths.static}/js/[name].chunk.js`,

        // This is the URL that app is served from. We use "/" in development.
        publicPath: paths.public,

        // Point sourcemap entries to original disk location (format as URL on Windows)
        devtoolModuleFilenameTemplate: info =>
            path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    },

    resolve: {
        // These are the reasonable defaults supported by the Node ecosystem.
        // We also include JSX as a common component filename extension to support
        // some tools, although we do not recommend using it, see:
        // https://github.com/facebookincubator/create-react-app/issues/290
        // `web` extension prefixes have been added for better support
        // for React Native Web.
        extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx'],

        // Allow absolute path module-resolution to our src/ directory
        modules: [process.env.NODE_PATH, 'node_modules'],
    },

    module: {
        strictExportPresence: true,

        rules: [
            // Disable require.ensure as it's not a standard language feature.
            { parser: { requireEnsure: false } },

            // First, run the linter.
            // It's important to do this before Babel processes the JS.
            {
                test: /\.(js|jsx|mjs)$/,
                enforce: 'pre',
                use: [
                    {
                        options: {
                            formatter: require('format-messages-webpack-plugin/formatter'),
                            emitWarning: true,
                            eslintPath: require.resolve('eslint'),
                        },
                        loader: require.resolve('eslint-loader'),
                    },
                ],
                include: [paths.docsDirectory, paths.srcDirectory, paths.testDirectory],
            },

            {
                // "oneOf" will traverse all following loaders until one will
                // match the requirements. When no loader matches it will fall
                // back to the "file" loader at the end of the loader list.
                oneOf: [
                    // "url" loader works like "file" loader except that it embeds assets
                    // smaller than specified limit in bytes as data URLs to avoid requests.
                    // A missing `test` is equivalent to a match.
                    {
                        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                        loader: require.resolve('url-loader'),
                        options: {
                            limit: 10000,
                            name: `${paths.static}/media/[name].[hash:8].[ext]`,
                        },
                    },

                    // Process JS with Babel.
                    {
                        test: /\.(js|jsx|mjs)$/,
                        include: [paths.docsDirectory, paths.srcDirectory, paths.testDirectory],
                        loader: require.resolve('babel-loader'),
                        options: {
                            // This is a feature of `babel-loader` for webpack (not Babel itself).
                            // It enables caching results in ./node_modules/.cache/babel-loader/
                            // directory for faster rebuilds.
                            cacheDirectory: true,
                        },
                    },

                    // Special loader pipeline for outputting global css
                    {
                        test: /global\.(css|scss)$/,
                        use: [
                            require.resolve('style-loader'),
                            {
                                loader: require.resolve('css-loader'),
                                options: { importLoaders: 2 },
                            },
                            { loader: require.resolve('postcss-loader') },
                            {
                                loader: require.resolve('sass-loader'),
                                options: { outputStyle: 'nested' },
                            },
                        ],
                    },

                    // "postcss" loader applies autoprefixer to our CSS.
                    // "css" loader resolves paths in CSS and adds assets as dependencies.
                    // "style" loader turns CSS into JS modules that inject <style> tags.
                    // In production, we use a plugin to extract that CSS to a file, but
                    // in development "style" loader enables hot editing of CSS.
                    {
                        test: /\.(css|scss)$/,
                        use: [
                            require.resolve('style-loader'),
                            {
                                loader: require.resolve('css-loader'),
                                options: {
                                    modules: true,
                                    importLoaders: 2,
                                    localIdentName: '[local]-[hash:8]',
                                },
                            },
                            { loader: require.resolve('postcss-loader') },
                            {
                                loader: require.resolve('sass-loader'),
                                options: { outputStyle: 'nested' },
                            },
                        ],
                    },

                    // "file" loader makes sure those assets get served by WebpackDevServer.
                    // When you `import` an asset, you get its (virtual) filename.
                    // In production, they would get copied to the `build` folder.
                    // This loader doesn't use a "test" so it will catch all modules
                    // that fall through the other loaders.
                    {
                        // Exclude `js` files to keep "css" loader working as it injects
                        // its runtime that would otherwise processed through "file" loader.
                        // Also exclude `html` and `json` extensions so they get processed
                        // by webpacks internal loaders.
                        exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
                        loader: require.resolve('file-loader'),
                        options: {
                            name: `${paths.static}/media/[name].[hash:8].[ext]`,
                        },
                    },
                ],
            },

            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
        ],
    },

    plugins: [
        // Add module names to factory functions so they appear in browser profiler.
        new webpack.NamedModulesPlugin(),

        // Makes some environment variables available to the JS code, for example:
        // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
        new webpack.DefinePlugin(
            JSON.stringify({
                'process.env.NODE_ENV': process.env.NODE_ENV,
            })
        ),

        // This is necessary to emit hot updates (currently CSS only):
        new webpack.HotModuleReplacementPlugin(),

        // Watcher doesn't work well if you mistype casing in a path so we use
        // a plugin that prints an error when you attempt to do this.
        // See https://github.com/facebookincubator/create-react-app/issues/240
        new CaseSensitivePathsPlugin(),

        // Moment.js is an extremely popular library that bundles large locale files
        // by default due to how Webpack interprets its code. This is a practical
        // solution that requires the user to opt into importing specific locales.
        // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
        // You can remove this if you don't use Moment.js:
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

        // Makes webpack build output pretty like it is from create-react-app
        new FormatMessagesWebpackPlugin({ notifications: false }),
    ],

    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
    },

    // Turn off performance hints during development because we don't do any
    // splitting or minification in interest of speed. These warnings become
    // cumbersome.
    performance: {
        hints: false,
    },
};
