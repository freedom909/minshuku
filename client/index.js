import React from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { TwitterLoginButton } from 'react-twitter-auth';
import { AppleLogin } from 'react-apple-login';
import App from '../frontend/src/app';
import dotenv from 'dotenv';

dotenv.config();

const container = document.getElementById('root');
if (!container) {
  console.error('Could not find element with id "root"');
  return;
}
const root = createRoot(container);

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
const APPLE_REDIRECT_URI = process.env.APPLE_REDIRECT_URI;

if (!googleClientId) {
  throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
}

if (!TWITTER_CONSUMER_KEY) {
  throw new Error('Missing TWITTER_CONSUMER_KEY environment variable');
}

if (!APPLE_CLIENT_ID) {
  throw new Error('Missing APPLE_CLIENT_ID environment variable');
}

if (!APPLE_REDIRECT_URI) {
  throw new Error('Missing APPLE_REDIRECT_URI environment variable');
}

const OAuthProviders = () => {
  const handleGoogleSuccess = (response) => {
    console.log('Google Login Success:', response);
    // Handle the token as needed
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
  };

  const handleTwitterSuccess = (response) => {
    console.log('Twitter Login Success:', response);
    // Handle the response as needed
  };

  const handleTwitterError = (error) => {
    console.error('Twitter Login Failed:', error);
  };

  const handleAppleSuccess = (response) => {
    console.log('Apple Login Success:', response);
    // Handle the response as needed
  };

  const handleAppleError = (error) => {
    console.error('Apple Login Failed:', error);
  };

  return (
    <div>
      <GoogleOAuthProvider clientId={googleClientId}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
        />
      </GoogleOAuthProvider>

      <TwitterLoginButton
        authCallback={handleTwitterSuccess}
        onFailure={handleTwitterError}
        consumerKey={TWITTER_CONSUMER_KEY}
      />

      <AppleLogin
        clientId={APPLE_CLIENT_ID}
        redirectURI={APPLE_REDIRECT_URI}
        onSuccess={handleAppleSuccess}
        onFailure={handleAppleError}
      />
    </div>
  );
};

root.render(
  <React.StrictMode>
    <App />
    <OAuthProviders />
  </React.StrictMode>
);

console.log('App has been rendered');