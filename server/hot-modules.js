import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../webpack.config.dev';

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
};
