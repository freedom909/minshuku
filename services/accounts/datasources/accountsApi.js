import { GraphQLError } from 'graphql';
import { validateInviteCode } from '../../../infrastructure/helpers/validateInvitecode.js';
import { validRegister,validLogin } from '../../../infrastructure/helpers/valid.js';
import { hashPassword, checkPassword } from '../../../infrastructure/helpers/passwords.js';
import pkgj from 'jsonwebtoken';
const { sign } = pkgj;
import EmailVerification from '../../../infrastructure/email/emailVerification.js';
import GoogleLogin from '../../../infrastructure/auth/googleLogin.js';
import axios from 'axios';

class AccountsAPI {
  constructor({ db }) {
    this.usersCollection = db.collection('users');
    this.emailVerification = new EmailVerification();
    this.googleLogin = new GoogleLogin();

    // Optionally, you can configure a base URL for axios
    this.httpClient = axios.create({
      baseURL: 'http://localhost:4011' // Adjust as needed
    });
  }

  async createAccount(email, password) {
    return this.auth0.createUser({
      connection: "Username-Password-Authentication",
      email,
      password
    });
  }

  async login(email, password) {
    if (validLogin(email, password)) {
      const existingUser = await this.getUserByEmail({ email });
      if (!existingUser) {
        throw new GraphQLError('User does not exist', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        });
      } 
      const passwordMatch = await checkPassword(password, existingUser.password);
      if (!passwordMatch) {
        throw new GraphQLError('Incorrect password', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        });
      }
      const payload = { id: user.id };
      const token = sign(payload, process.env.JWT_SECRET, {
        algorithm: 'HS256',
        subject: user.id.toString(),
        expiresIn: '1d'
      });
      return { token };
    }
  }

  async registerGuest(email, password, name, nickname, role = "GUEST", picture) {
    return this.register({ email, password, name, nickname, role, picture });
  }

  async registerHost(email, password, name, nickname, role = "HOST", picture) {
    return this.register({ email, password, name, nickname, role, picture });
  }

  async register({ email, password, name, nickname, role, picture }) {
    // Assuming validRegister is a function or a variable defined elsewhere
    if (validRegister) {
      const existingUser = await this.getUserByNickname({ nickname });
      if (existingUser) {
        if (existingUser.nickname === nickname) {
          throw new GraphQLError('Nickname is already in use, please use another one', {
            extensions: {
              code: 'BAD_USER_INPUT'
            }
          });
        }
      }
    }
  
    const passwordHash = await hashPassword(password);
    const newUser = {
      email,
      name,
      password: passwordHash,
      nickname,
      role,
      picture
    };
  
    try {
      const result = await this.usersCollection.insertOne(newUser);
      if (!result.insertedId) {
        throw new Error('Failed to insert user');
      }
  
      const payload = { _id: result.insertedId };
      const token = sign(payload, process.env.JWT_SECRETKEY, {
        algorithm: 'HS256',
        subject: result.insertedId.toString(),
        expiresIn: '1d'
      });
      return { ...newUser, _id: result.insertedId, token };
      await this.emailVerification.sendActivationEmail(email, token);
    } catch (e) {
      console.error('Registration error:', e); // Log the error details for debugging
      throw new GraphQLError('Email is already in use or an internal server error occurred', {
        extensions: {
          code: 'SERVER_ERROR'
        }
      });
    }
  }

  async activateUser(req, res) {
    const { token } = req.body;
    try {
      const decoded = await this.emailVerification.activateUser(token);
      const { name, email, password } = decoded;
      const newUser = new UserActivation({
        name,
        email,
        password
      });
      newUser.save((err, user) => {
        if (err) {
          return res.status(401).json({
            errors: 'Expired link, please signup again'
          });
        } else {
          return res.json({
            success: true,
            data: user,
            message: 'Account activated successfully'
          });
        }
      });
    } catch (error) {
      return res.status(401).json({
        errors: error
      });
    }
  }

  async googleLogin(req, res) {
    const token = req.body.token;
    try {
      const payload = await this.googleLogin.verifyGoogleToken(token);
      const { email, name, picture } = payload;
      let user = await this.getUserByEmail(email);
      if (!user) {
        user = await this.createAccount(email, payload.password, name, picture);
      }
      const jwtToken = this.googleLogin.generateToken(user);
      res.status(200).json({ token: jwtToken });
    } catch (error) {
      res.status(400).json({ error: 'Google login failed' });
    }
  }

  async getUserByEmail(email) {
    const url = `/user`;
    const body = { email };
    const result = await this.httpClient.post(url, body);
    return result.data[0];
  }

  async getUserById(userId) {
    const url = `/user/${userId}`;
    const result = await this.httpClient.get(url);
    return result.data[0];
  }

  async getUserByNickname({ nickname }) {
    const url = `/user`;
    const body = { nickname };
    try {
      const result = await this.httpClient.post(url, body);
      return result.data[0];
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // No user found
      }
      throw error; // Rethrow other errors
    }
  }  

  async getAccountByEmail({ email }) {
    const url = `/account`;
    const body = { email };
    const result = await this.httpClient.post(url, body);
    return result.data[0];
  }

  async getUserByEmail({ email }) {
    const account = await this.getAccountByEmail({ email });
    if (!account) {
      throw new Error('Account not found');
    }

    const userId = account.id;
    return this.getUserById(userId);
  }


  async updateUser(userId, userInfo) {
    const url = `users/${userId}`;
    const result = await this.httpClient.patch(url, userInfo);
    return result.data;
  }

  async getUser(userId) {
    const url = `user/${userId}`;
    const result = await this.httpClient.get(url);
    return result.data[0];
  }

  async getGalacticCoordinates(userId) {
    const url = `users/${userId}/coordinates`;
    const result = await this.httpClient.get(url);
    return result.data;
  }
}

export default AccountsAPI;
