import webpack from 'webpack';
import chokidar from 'chokidar';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../webpack.config.dev';

const clearFromRequireCache = str =>
    Object.keys(require.cache).forEach(id =>
        [].concat(str).forEach(test => {
            if (id.includes(test) && !id.includes('/node_modules/')) {
                delete require.cache[id];
                console.log('[SSR] Hot-reloaded:', id);
            }
        })
    );

export default app => {
    const compiler = webpack(config);

    app.use(
        webpackDevMiddleware(compiler, {
            logLevel: 'silent',
            hot: true,
            index: false,
            publicPath: config.output.publicPath,
        })
    );

    app.use(
        webpackHotMiddleware(compiler, {
            log: console.log,
            reload: true,
        })
    );

    // Hot-reload any changes to client files (needed for proper SSR updating)
    compiler.plugin('done', () => clearFromRequireCache(['/src/', 'react-renderer']));

    // Hot-reload any changes to server files (needed for proper SSR updating)
    const watcher = chokidar.watch('./');
    watcher.on('ready', () => watcher.on('all', () => clearFromRequireCache(['/server/'])));
};
