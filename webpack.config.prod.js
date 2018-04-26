const path = require('path');
const glob = require('glob-all');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const PurifyCssPlugin = require('purifycss-webpack');

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
    serverDirectory: makePath('server'),

    // Files
    entryFile: makePath('src/index.js'),
    packageFile: makePath('package.json'),
};

// We'll need this more than once
const cssFilename = `${paths.static}/css/[name].[md5:contenthash:hex:20].css`;

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
if (process.env.NODE_ENV !== 'production') {
    throw new Error('Production builds must have NODE_ENV=production.');
}

// This is the production configuration.
// It compiles slowly and is focused on producing a fast and minimal bundle.
// The development configuration is different and lives in a separate file.
module.exports = {
    // Don't attempt to continue if there are any errors.
    bail: true,

    // We generate sourcemaps in production. This is slow but gives good results.
    // You can exclude the *.map files from the build during deployment.
    devtool: 'source-map',

    // New flag in webpack v4 to flag for minification
    // https://medium.com/webpack/webpack-4-mode-and-optimization-5423a6bc597a
    mode: 'production',

    // In production, we only want to load the polyfills and the app code.
    entry: {
        app: [require.resolve('babel-polyfill'), paths.entryFile],
    },

    output: {
        // The build folder.
        path: paths.buildDirectory,

        // Generated JS file names (with nested folders).
        // There will be one main bundle, and one file per asynchronous chunk.
        // We don't currently advertise code splitting but Webpack supports it.
        filename: `${paths.static}/js/[name].[chunkhash:8].js`,

        chunkFilename: `${paths.static}/js/[name].[chunkhash:8].chunk.js`,

        // We inferred the "public path" (such as / or /my-project) from homepage.
        publicPath: paths.public,

        // Point sourcemap entries to original disk location (format as URL on Windows)
        devtoolModuleFilenameTemplate: info =>
            path.relative(paths.srcDirectory, info.absoluteResourcePath).replace(/\\/g, '/'),
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
                    // "url" loader works just like "file" loader but it also embeds
                    // assets smaller than specified size as data URLs to avoid requests.
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
                        options: { compact: true },
                    },

                    // Special loader pipeline for outputting global css
                    {
                        test: /global\.(css|scss)$/,
                        loader: ExtractTextPlugin.extract({
                            fallback: {
                                loader: require.resolve('style-loader'),
                                options: { hmr: false },
                            },
                            use: [
                                {
                                    loader: require.resolve('css-loader'),
                                    options: {
                                        importLoaders: 2,
                                        minimize: true,
                                        sourceMap: true,
                                    },
                                },
                                { loader: require.resolve('postcss-loader') },
                                {
                                    loader: require.resolve('sass-loader'),
                                    options: { outputStyle: 'expanded' },
                                },
                            ],
                        }),
                    },

                    // The notation here is somewhat confusing.
                    // "postcss" loader applies autoprefixer to our CSS.
                    // "css" loader resolves paths in CSS and adds assets as dependencies.
                    // "style" loader normally turns CSS into JS modules injecting <style>,
                    // but unlike in development configuration, we do something different.
                    // `ExtractTextPlugin` first applies the "postcss" and "css" loaders
                    // (second argument), then grabs the result CSS and puts it into a
                    // separate file in our build process. This way we actually ship
                    // a single CSS file in production instead of JS code injecting <style>
                    // tags. If you use code splitting, however, any async bundles will still
                    // use the "style" loader inside the async code so CSS from them won't be
                    // in the main CSS file.
                    {
                        test: /\.(css|scss)$/,
                        loader: ExtractTextPlugin.extract({
                            fallback: {
                                loader: require.resolve('style-loader'),
                                options: { hmr: false },
                            },
                            use: [
                                {
                                    loader: require.resolve('css-loader'),
                                    options: {
                                        modules: true,
                                        importLoaders: 2,
                                        localIdentName: '_wl_[local]-[hash:8]',
                                        // minimize: true,
                                        sourceMap: true,
                                    },
                                },
                                { loader: require.resolve('postcss-loader') },
                                {
                                    loader: require.resolve('sass-loader'),
                                    options: { outputStyle: 'expanded' },
                                },
                            ],
                        }),
                        // Note: this won't work without `new ExtractTextPlugin()` in `plugins`.
                    },

                    // "file" loader makes sure assets end up in the `build` folder.
                    // When you `import` an asset, you get its filename.
                    // This loader doesn't use a "test" so it will catch all modules
                    // that fall through the other loaders.
                    {
                        // Exclude `js` files to keep "css" loader working as it injects
                        // it's runtime that would otherwise processed through "file" loader.
                        // Also exclude `html` and `json` extensions so they get processed
                        // by webpacks internal loaders.
                        exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
                        loader: require.resolve('file-loader'),
                        options: {
                            name: `${paths.static}/media/[name].[hash:8].[ext]`,
                        },
                    },

                    // ** STOP ** Are you adding a new loader?
                    // Make sure to add the new loader(s) before the "file" loader.
                ],
            },
        ],
    },

    plugins: [
        // Makes some environment variables available to the JS code, for example:
        // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
        // It is absolutely essential that NODE_ENV was set to production here.
        // Otherwise React will be compiled in the very slow development mode.
        new webpack.DefinePlugin(
            JSON.stringify({
                'process.env.NODE_ENV': process.env.NODE_ENV,
            })
        ),

        // Note: this won't work without ExtractTextPlugin.extract(..) in `loaders`.
        new ExtractTextPlugin({ filename: cssFilename, allChunks: true }),

        // Generate a manifest file which contains a mapping of all asset filenames
        // to their corresponding output file so that tools can pick it up without
        // having to parse `index.html`.
        new ManifestPlugin({
            fileName: '../asset-manifest.json',
        }),

        // Moment.js is an extremely popular library that bundles large locale files
        // by default due to how Webpack interprets its code. This is a practical
        // solution that requires the user to opt into importing specific locales.
        // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
        // You can remove this if you don't use Moment.js:
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

        // Strip out unused CSS
        new PurifyCssPlugin({
            paths: glob.sync([
                `${paths.srcDirectory}/**/*.js`,
                `${paths.docsDirectory}/**/*.js`,
                `${paths.serverDirectory}/html.js`,
            ]),
            purifyOptions: {
                whitelist: ['_wl_*'],
            },
        }),
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
};
