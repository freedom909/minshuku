import React from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { FacebookOAuthProvider } from '@react-oauth/facebook';
import App from './src/app';
import dotenv from 'dotenv';

dotenv.config();

const container = document.getElementById('root');
const root = createRoot(container);

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
}

if (!FACEBOOK_CLIENT_ID) {
  throw new Error('Missing FACEBOOK_CLIENT_ID environment variable');
}

root.render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
