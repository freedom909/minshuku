import React from 'react';
import ReactDOM from 'react-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import App from './App.js';
import theme from './theme.js';
import { ChakraProvider } from '@chakra-ui/react';
// import dotenv from 'dotenv';
// dotenv.config();

const auth0Domain = "dev-9saus9he.jp.auth0.com"
const auth0ClientId = "nqu0Q3xTbjmo3tWSBQEISvkrX6WXK6mF"
const auth0Audience = "https://settling-shiner-13.hasura.app/v1/graphql"
// const redirectUri=window.location.origin

const httpLink = createHttpLink({
  uri: 'http://localhost:4000', // or your GraphQL server URI
});

const authLink = setContext(async (_, { headers }) => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  if (isAuthenticated) {
    const token = await getAccessTokenSilently();
    return {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    };
  } else {
    return {
      headers: {
        ...headers,
      },
    };
  }
});



const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  name: 'web-client',
  version: '0.9'
});

const AppWithAuth = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently();
        localStorage.setItem('token', token);
      }
    };

    fetchData();
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <ChakraProvider theme={theme}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </ChakraProvider>
  );
};
ReactDOM.render(
  <React.StrictMode>
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      redirectUri={window.location.origin}
      cacheLocation="localstorage"
      audience={auth0Audience}
    >
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

