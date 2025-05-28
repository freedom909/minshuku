// pages/_app.js
import { ApolloProvider } from '@apollo/client';
import { SessionProvider } from 'next-auth/react';
import client from '@/lib/apolloClient';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ApolloProvider client={client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </SessionProvider>
  );
}

export default MyApp;