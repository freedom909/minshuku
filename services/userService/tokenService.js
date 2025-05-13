//services/userService/tokenService.js
import jwt from 'jsonwebtoken';
const { sign, verify, decode } = jwt;
import dotenv from 'dotenv';
import { RESTDataSource } from '@apollo/datasource-rest';
import axios from 'axios';
dotenv.config();

// Secret key for signing tokens (replace this with your actual secret)
const secretKey = process.env.JWT_SECRET || 'good';

// Function to generate JWT token

class TokenService extends RESTDataSource {
    constructor({ secretKey, expiresIn }) {
        if (!secretKey) {
            throw new Error('Secret key is required');
        }
        super();
        this.secretKey = secretKey;
        this.expiresIn = expiresIn || '1h';
    }

    async getUserFromToken(token) {
        try {
            if (token) {
                const user = jwt.verify(token, this.secretKey); // Verify the token using the secret key
                console.log('User extracted from token:', user); // Optional: Log user info for debugging
                return user; // Return the user object
            }
            return null;
        } catch (error) {
            console.error('Invalid token', error);
            return null;
        }
    }

    async generateToken(user) {
        const payload = {
            userId: user._id.toString(), // Assuming user has an _id field
            email: user.email,
            role: user.role,
        };
        return sign(payload, this.secretKey, { expiresIn: this.expiresIn });
    }

    async getToken(code){ 
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
      
      
    // Verify JWT Token
    async verifyToken(token) {
        try {
            return verify(token, this.secretKey);
        } catch (error) {
            throw new Error("Invalid or expired token");
        }
    }

    // Decode JWT Token without verifying (useful for inspecting the token)
    decodeToken(token) {
        return decode(token);
    }
}

export default TokenService;