import ApolloClient from 'apollo-boost';

export default (options = {}) =>
    new ApolloClient({
        uri: 'https://fakerql.com/graphql',
        ...options,
    });
