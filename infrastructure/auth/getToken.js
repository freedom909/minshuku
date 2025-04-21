import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();  // Load environment variables from .env file

// Function to exchange authorization code for access token
async function getToken(code) {
  const options = {
    method: 'POST',
    url: 'https://oauth2.googleapis.com/token',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI // Ensure this matches the redirect URI registered in your Google Cloud Console
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