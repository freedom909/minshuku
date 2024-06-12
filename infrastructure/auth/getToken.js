import axios from 'axios';

async function getToken(username, password) {
  const options = {
    method: 'POST',
    url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: new URLSearchParams({
      audience: process.env.AUTH0_AUDIENCE,
      client_id: process.env.AUTH0_CLIENT_ID_GRAPHQL,
      client_secret: process.env.AUTH0_CLIENT_SECRET_GRAPHQL,
      grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
      password,
      realm: 'Username-Password-Authentication',
      scope: 'openid',
      username
    })
  };

  try {
    const response = await axios(options);
    const { access_token } = response.data;

    if (!access_token) {
      throw new Error(response.data.error_description || 'Cannot retrieve access token.');
    }

    return access_token;
  } catch (error) {
    throw new Error(error.response ? error.response.data.error_description : error.message);
  }
}

export default getToken;
