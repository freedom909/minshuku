// app/layout.js
'use client';

// import { GeistSans, GeistMono } from 'geist/font';
import { GeistSans } from 'geist/font/sans';

import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { ApolloProvider } from '@apollo/client';
import client from '@/lib/apolloClient';
import Image from 'next/image';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistSans.css}`}>
      <body>
        <SessionProvider>
          <ApolloProvider client={client}>
            {children}
          </ApolloProvider>
        </SessionProvider>
      </body>
    </html>
  );
}