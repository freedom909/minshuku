import { RESTDataSource } from '@apollo/datasource-rest';
import { GraphQLError } from 'graphql';
import { validateInviteCode } from '../../infrastructure/helpers/validateInvitecode.js';
import { hashPassword, checkPassword } from '../../infrastructure/helpers/passwords.js';
import pkgj from 'jsonwebtoken';
const { sign } = pkgj;
import EmailVerification from '../../infrastructure/email/emailVerification.js';
import GoogleLogin from '../../infrastructure/auth/googleLogin.js';


class AccountsAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'http://localhost:4011/';
    this.emailVerification = new EmailVerification();
    this.googleLogin = new GoogleLogin();
  }

  async createAccount(email, password) {
    return this.auth0.createUser({
      connection: "Username-Password-Authentication",
      email,
      password
    });
  }

  async login(email, password) {
    const message = 'Username or password is incorrect';
    let user;
    try {
      user = await this.getUserByEmail(email);
      const isValidPassword = await checkPassword(password, user.password);
      if (!isValidPassword) {
        throw new GraphQLError(message, {
          extensions: {
            code: 'BAD_EMAIL_OR_PASSWORD',
            description: message
          }
        });
      }
    } catch (error) {
      if (!user) {
        throw new GraphQLError(message, {
          extensions: {
            code: 'BAD_EMAIL',
            description: 'User with that email does not exist'
          }
        });
      }
      return user;
    }
    const payload = { id: user.id };
    const token = sign(payload, process.env.JWT_SECRET, {
      algorithm: 'HS256',
      subject: user.id.toString(),
      expiresIn: '1d'
    });
    return { token };
  }

  async registerGuest(email, password, name, nickname, role = 'GUEST', picture) {
    const existingUser = await this.getUserByEmailOrNickname({ email, nickname });
    if (existingUser) {
      if (existingUser.email === email) {
        throw new GraphQLError('Email is already in use', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        });
      } else if (existingUser.nickname === nickname) {
        throw new GraphQLError('Nickname is already in use', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        });
      }
    }

    if (!validator.isStrongPassword(password)) {
      throw new GraphQLError('The password must be at least 8 characters long and contain a mix of uppercase letters, lowercase letters, numbers, and symbols', {
        extensions: {
          code: 'BAD_PASSWORD'
        }
      });
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      email,
      name,
      password: passwordHash,
      nickname,
      role: 'GUEST',
      picture
    };

    try {
      const { data, error } = await this.post(`/user`, newUser);
      if (error) {
        throw new GraphQLError('Something went wrong on our end', {
          extensions: {
            code: 'SERVER_ERROR'
          }
        });
      }

      const payload = { id: data.id };
      const token = sign(payload, process.env.JWT_SECRET, {
        algorithm: 'HS256',
        subject: data.id.toString(),
        expiresIn: '1d'
      });

      await this.emailVerification.sendActivationEmail(email, token);

      return { token };
    } catch (e) {
      throw new GraphQLError('Email is already in use', {
        extensions: {
          code: 'BAD_EMAIL'
        }
      });
    }
  }

  async registerHost(email, password, nickname, name, inviteCode, picture) {
    validateInviteCode(inviteCode);

    if (!validator.isStrongPassword(password)) {
      throw new GraphQLError('The password must be at least 8 characters long and contain a mix of uppercase letters, lowercase letters, numbers, and symbols', {
        extensions: {
          code: 'BAD_PASSWORD'
        }
      });
    }

    const res = await Promise.all([
      this.get(`/users?email=${email}&&nickname=${nickname}`)
    ]);

    const [existingEmail, existingNickname] = res;

    if (existingEmail.length) {
      throw new GraphQLError('Email is already in use', {
        extensions: {
          code: 'BAD_USER_INPUT'
        }
      });
    } else if (existingNickname.length) {
      throw new GraphQLError('Username already in use', {
        extensions: {
          code: 'BAD_USER_INPUT'
        }
      });
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      name,
      email,
      password: passwordHash,
      nickname,
      picture,
      role: 'HOST'
    };

    try {
      const { data, error } = await this.post(`/user`, newUser);

      const payload = { id: data.id };
      const token = sign(payload, process.env.JWT_SECRET, {
        algorithm: 'HS256',
        subject: data.id.toString(),
        expiresIn: '1d'
      });

      await this.emailVerification.sendActivationEmail(email, token);

      return { token };
    } catch (e) {
      throw new GraphQLError('Something went wrong on our end', {
        extensions: {
          code: 'SERVER_ERROR',
          description: 'Something went wrong on our end'
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

  async getUserByEmail ( email ) {
    const url = `/user`
    const body = { email }
    const result = await this.post(url, body)
    console.log(this)
    return result.data[0]
  }

  async getUserById (userId) {
    const url = `/user/${userId}`
    console.log(url)
    const result = await this.get(url)
    console.log(result)
    return result.data[0]
  }
        
  async getUserByEmailOrNickname ({email, nickname} ) {
    const url = `/user`
    const body = { email,nickname }
    const result = await this.post(url, body)
    return result.data[0]
  }

  updateUser (userId, userInfo ) {
    return this.patch(`users/${userId}`, { body: { ...userInfo } })
  }
  getUser (userId) {
    return this.get(`user/${userId}`)
  }
  getGalacticCoordinates (userId) {
    return this.get(`users/${userId}/coordinates`)
  }
}

export default AccountsAPI