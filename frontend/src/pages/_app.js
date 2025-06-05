import { ApolloProvider } from '@apollo/client';
import client from '../lib/apolloClient';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme';

function MyApp({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </ApolloProvider>
  );
}

export default MyApp;