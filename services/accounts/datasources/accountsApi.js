
import pkgj from 'jsonwebtoken';
const { sign } = pkgj;
import EmailVerification from '../../../infrastructure/email/emailVerification.js';
import GoogleLogin from '../../../infrastructure/auth/googleLogin.js';
// import axios from 'axios';
import UserRepository from '../../../infrastructure/userRepository.js';
// Your database connection
import UserService from '../../users/datasources/userService.js';

class AccountsAPI {
  constructor({ db }) {
    if (!db) {
      throw new Error('Database connection is required');
    }
    this.usersCollection = db.collection('users');
    this.emailVerification = new EmailVerification();
    this.googleLogin = new GoogleLogin();

    // Optionally, you can configure a base URL for axios
    this.httpClient = axios.create({
      baseURL: 'http://localhost:4011', // Adjust as needed
    });
  }

  async createAccount(email, password) {
    return this.auth0.createUser({
      connection: "Username-Password-Authentication",
      email,
      password
    });
  }


  async registerGuest(email, password, name, nickname, role = "GUEST", picture) {
    return this.register({ email, password, name, nickname, role, picture });
  }

  async registerHost(email, password, name, nickname, role = "HOST", picture) {
    return this.register({ email, password, name, nickname, role, picture });
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
async function initializeServices() {
  const db = await connectToDatabase();
  const userRepository = new UserRepository(db);
  const userService = new UserService(userRepository);
  const accountsAPI = new AccountsAPI({ db });
  return {
    userService,
    accountsAPI
  };
}
export default AccountsAPI;
export {initializeServices}


