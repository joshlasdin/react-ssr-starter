import React from 'react';
import { hydrate } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import createApolloClient from 'data/create-apollo-client';
import clientState from 'data/client-state';
import App from './app';

// Global Styles
import './style/global.scss';

// Create Apollo client
const client = createApolloClient({ clientState });

// Hydrate state
client.cache.restore(window.__STATE__);

// Hydrate app
hydrate(
    <BrowserRouter>
        <App client={client} />
    </BrowserRouter>,
    document.getElementById('root')
);
