import { RESTDataSource } from '@apollo/datasource-rest';
import { GraphQLError, graphql } from 'graphql';
import {validateInviteCode} from '../helpers/validateInvitecode.js'
import { hashPassword, checkPassword } from '../helpers/passwords.js'
import jwt from "jsonwebtoken";

import nodemailer from 'nodemailer'
class AccountsAPI extends RESTDataSource {
  baseURL = "http://localhost:4011/";

  async login({ email, password }) {
    const message = "Username or password is incorrect";
    let user;
    try {
      user = await this.getUserByEmail(email);
      console.log(user);
      const isValidPassword = await checkPassword(password, user.password);
      if (!isValidPassword) {
        throw new GraphQLError(message, {
          extensions: {
            code: "BAD_EMAIL_OR_PASSWORD",
            description: "Username or password is incorrect",
          },
        });
      }
    } catch (error) {
      if (!user) {
        throw new GraphQLError(message, {
          extensions: {
            code: "BAD_EMAIL",
            description: "User with that email does not exist",
          },
        });
      }
      return user;
    }
    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET,{
      algorithm: "HS256",
      subject: user.id.toString(),
      expiresIn: "1d",
    });
    console.log(token);
    return { token};
  }

  async registerUser({ email, password, name, nickname, role = "GUEST" }) {
    // const existingUser = await this.getUserByEmailOrNickname({ email, nickname });
    const existingUser = await this.getUserByEmailOrNickname({ email,nickname });
    if (existingUser) {
      if (existingUser.email === email) {
        throw new ApolloServerErrorCode.BAD_USER_INPUT(
          "Email is already in use"
        );
      } else if (existingUser.nickname === nickname) {
        throw new ApolloServerErrorCode.BAD_USER_INPUT(
          "Username is already in use"
        );
      }
    }

    if (!validator.isStrongPassword(password)) {
      throw new GraphQLError("message", {
        extensions: {
          code: "BAD_PASSWORD",
          description:
            "The password must be at least 8 characters long and contain a mix of uppercase letters, lowercase letters, numbers, and symbols",
        },
      });
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      email,
      name,
      password: passwordHash,
      nickname,
      role,
    };
    console.log(newUser);
    try {
      const { data, error } = await this.post(`/user`, newUser);
      if (error) {
        throw new GraphQLError("message", {
          extensions: {
            code: "SERVER_ERROR",
            description: "Something went wrong on our end",
          },
        });
      }

      const payload = { id: data.id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        algorithm: "HS256",
        subject: user.id.toString(),
        expiresIn: "1d", // expiration time
      },process.env.JWT_ACCOUNT_ACTIVATION,{
        expiresIn:'5m'
      });

      const emailData={
        from:process.env.EMAIL_FROM,
        to:email,
        subject:'Account activation link',
        html:`
        <h1>Please use the following to activate your account</h1>
        <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
        <hr />
        <p>This email may containe sensetive information</p>
        <p>${process.env.CLIENT_URL}</p>
        `
      }

      let transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
          user:process.env.EMAIL_FROM,
          pass:process.env.EMAIL_PASSWORD,
        }
      })
    transporter.sendMail(emailData,function (error,info) {
      if (error) {
        console.log(error);
      }else{
        console.log(info.response +'was send');
      }
    });

  
      return { token };
    } catch (e) {
      throw new GraphQLError("message", {
        extensions: {
          code: "BAD_EMAIL",
          description: "The email is already in use",
        },
      });
    }
  }

  async registerHost(email, password, nickname, name, inviteCode) {
    throw new GraphQLError("message", {
      extensions: {
        code: "BAD_INPUT",
        description: "email, password, name, inviteCode must not be null",
      },
    });
  
   
     // Check for existing email and nickname
    const res = await Promise.all([
      this.get(`/users?email=${email}&& ${nickname}`),
    ]);
   
    const [existingEmail, existingNickname] = res;
    validateInviteCode( _,inviteCode)
    if (existingEmail.length) {
      throw new ApolloServerErrorCode.BAD_USER_INPUT("Email is already in use");
    } else if (existingNickname.length) {
      throw new ApolloServerErrorCode.BAD_USER_INPUT(
        `Username ${existingNickname} already in use`
      );
    }
 // Validate password strength
    if (!validator.isStrongPassword(password)) {
      throw new GraphQLError("message", {
        extensions: {
          code: "BAD_PASSWORD",
          description:
            "The password must be at least 8 characters long and contain a mix of uppercase letters, lowercase letters, numbers, and symbols",
        },
      });
    }
    const user = await this.getUserByEmail(email);

    const passwordHash = await hashPassword(password);
    const newUser = {
      name,
      email,
      password: passwordHash,
      username,
      role: "HOST"
    };

    try {
      const { data, error } = await this.post(`/users`, newUser);
      if (error) {
        throw new GraphQLError(error.message);
      }
      const payload = { id: data.id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        algorithm: "HS256",
        subject: user.id.toString(),
        expiresIn: "1d", // expiration time
      },process.env.JWT_ACCOUNT_ACTIVATION,{
        expiresIn:'5m'
      });
      // Send activation email using nodemailer
      const emailData={
        from:process.env.EMAIL_FROM,
        to:email,
        subject:'Account activation link',
        html:`
        <h1>Please use the following to activate your account</h1>
        <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
        <hr />
        <p>This email may containe sensetive information</p>
        <p>${process.env.CLIENT_URL}</p>
        `
      }
      let transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
          user:process.env.EMAIL_FROM,
          pass:process.env.EMAIL_PASSWORD,
        }
      })
    transporter.sendMail(emailData,function (error,info) {
      if (error) {
        console.log(error);
      }else{
        console.log(info.response +'was send');
      }
    });
      return { token};
    }  catch (e) {
      throw new GraphQLError("message", {
        extensions: {
          code: "SERVER_ERROR",
          description: "Something went wrong on our end",
        },
      });
    }
  }

  async getUserByEmail({ email }) {
    const url = `/user`;
    const body = { email };
    const result = await this.post(url, body);
    console.log(this);
    return result.data[0];
  }

  async getUserById(userId) {
    const url = `/user/${userId}`;
    console.log(url);
    const result = await this.get(url);
    console.log(result);
    return result.data[0];
  }

  async getUserByEmailOrNickname({ email, nickname }) {
    const url = `/user`;
    const body = { email, nickname };
    const result = await this.post(url, body);
    return result.data[0];
  }

  updateUser({ userId, userInfo }) {
    return this.patch(`users/${userId}`, { body: { ...userInfo } });
  }
  getUser(userId) {
    return this.get(`user/${userId}`);
  }
  getGalacticCoordinates(userId) {
    return this.get(`users/${userId}/coordinates`);
  }
}

export default AccountsAPI
