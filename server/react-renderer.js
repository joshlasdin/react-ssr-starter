import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { renderToStringWithData } from 'react-apollo';
import createApolloClient from 'data/create-apollo-client';
import App from 'app';
import HTML from './html';

export default async (req, res) => {
    try {
        const routerContext = { data: {} };
        const client = createApolloClient({ ssrMode: true });

        // Render application
        const app = await renderToStringWithData(
            <StaticRouter location={req.url} context={routerContext}>
                <App client={client} />
            </StaticRouter>
        );

        // Somewhere a `<Redirect>` was rendered
        if (routerContext.url) {
            return res.redirect(routerContext.status || 301, routerContext.url);
        }

        // Compile list of necessary scripts
        const stylesheets = [];
        const scripts = [];

        if (process.env.NODE_ENV === 'development') {
            scripts.push({ src: '/static/js/bundle.js' });
        }

        if (process.env.NODE_ENV === 'production') {
            const assets = require('../asset-manifest.json');
            stylesheets.push({ href: assets['app.css'] });
            scripts.push({ src: assets['app.js'] });
        }

        const html = renderToStaticMarkup(
            <HTML
                title="My SSR Test"
                favicon=""
                stylesheets={stylesheets}
                scripts={scripts}
                initialState={client.extract()}
                app={app}
            />
        );

        // Prepend a doctype and ship it!
        return res.send(`<!DOCTYPE html>\n${html}`);
    } catch (err) {
        console.warn('Error rendering React application', err);
        return res.status(500).send(err || { message: 'Server error' });
    }
};
