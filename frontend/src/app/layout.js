// app/layout.js
'use client';

import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { ApolloProvider } from '@apollo/client';
import client from '@/lib/apolloClient';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">
        <SessionProvider>
          <ApolloProvider client={client}>
            {children}
          </ApolloProvider>
        </SessionProvider>
      </body>
    </html>
  );
}