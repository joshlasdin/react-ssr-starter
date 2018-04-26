import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { ApolloProvider } from 'react-apollo';
import { hot } from 'react-hot-loader';
import ErrorBoundary from 'react-error-boundary';
import routes from 'routing/routes';

export default hot(module)(({ client }) => (
    <ErrorBoundary>
        <ApolloProvider client={client}>
            <Switch>{routes.map(route => <Route key={route.path} {...route} />)}</Switch>
        </ApolloProvider>
    </ErrorBoundary>
));
