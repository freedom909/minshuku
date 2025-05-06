import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { SAVE_OAUTH_USER } from '../graphql/mutations';

const providerInfo = {
  google: {
    userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    tokenKey: 'googleToken',
  },
  github: {
    userInfoUrl: 'https://api.github.com/user',
    tokenKey: 'githubToken',
  },
  facebook: {
    userInfoUrl: 'https://graph.facebook.com/me?fields=id,name,email,picture',
    tokenKey: 'facebookToken',
  },
  twitter: {
    userInfoUrl: 'https://api.twitter.com/2/me', // Example placeholder
    tokenKey: 'twitterToken',
  },
};

const OAuthHandler = ({ code }) => {
  const navigate = useNavigate();
  const [saveOAuthUser, { loading, error }] = useMutation(SAVE_OAUTH_USER);

  useEffect(() => {
    const fetchProfileAndSaveUser = async () => {
      try {
        // Detect which provider token is available
        const provider = Object.keys(providerInfo).find((p) => code[providerInfo[p].tokenKey]);

        if (!provider) {
          throw new Error('No valid OAuth provider token found');
        }

        const token = code[providerInfo[provider].tokenKey];
        const userInfoUrl = providerInfo[provider].userInfoUrl;

        // Fetch user profile
        const res = await fetch(userInfoUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = await res.json();

        // Normalize profile fields as needed
        const normalized = {
          email: profile.email || profile.login || '', // GitHub uses login
          name: profile.name || profile.login,
          picture: profile.picture || (profile.avatar_url || (profile.picture?.data?.url ?? '')),
        };

        await saveOAuthUser({
          variables: {
            input: {
              provider,
              token,
              email: normalized.email,
              name: normalized.name,
              picture: normalized.picture,
            },
          },
        });

        navigate('/dashboard');
      } catch (err) {
        console.error('❌ Failed to save OAuth user:', err.message);
      }
    };

    if (code) {
      fetchProfileAndSaveUser();
    }
  }, [code]);

  if (loading) return <p>Logging in...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return null;
};

export default OAuthHandler;
