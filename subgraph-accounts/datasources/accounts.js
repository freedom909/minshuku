import { RESTDataSource } from '@apollo/datasource-rest';
import { GraphQLError } from 'graphql';
import { hashPassword, checkPassword } from '../helpers/passwords.js'


class AccountsAPI extends RESTDataSource {
  baseURL = 'http://localhost:4011/';
  
  async login({ email, password }) {
    const message = "Username or password is incorrect";
    let user;
    try {
      user = await this.getUserByEmail(email)
      console.log(user);
      const isValidPassword = await checkPassword(password, user.password)
      if (!isValidPassword) {
        throw new GraphQLError(message, {
          extensions: {
            code: 'BAD_EMAIL_OR_PASSWORD',
            description: "Username or password is incorrect"
          }
        })
      }

    } catch (error) {
      if (!user) {
        throw new GraphQLError(message, {
          extensions: {
            code: "BAD_EMAIL",
            description: "User with that email does not exist"
          }
        });
      }
      return user

    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      algorithm: "HS256",
      subject: user.id.toString(),
      expiresIn: "1d"
    });
    console.log(token);
    return { token, userRole: user.role };
  }

  async registerUser(email, password, name, nickname, role) {
    // const existingUser = await this.getUserByEmailOrNickname({ email, nickname });
    const existingUser = await this.getUserByEmail({ email});
    if (existingUser) {
      if (existingUser.email === email) {
        throw new ApolloServerErrorCode.BAD_USER_INPUT('Email is already in use');
      } else if (existingUser.nickname === nickname) {
        throw new ApolloServerErrorCode.BAD_USER_INPUT('Username is already in use');
      }
    }

    if (!validator.isStrongPassword(password)) {
      throw new GraphQLError('message', {
        extensions: {
          code: 'BAD_PASSWORD',
          description:
            'The password must be at least 8 characters long and contain a mix of uppercase letters, lowercase letters, numbers, and symbols',
        },
      });
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      email,
      name,
      password: passwordHash,
      nickname,
      role
    };
console.log(newUser);
try {
  const { data, error } = await this.post(`/user`, newUser);
  if (error) {
    throw new GraphQLError('message', {
      extensions: {
        code: 'SERVER_ERROR',
        description: 'Something went wrong on our end',
      },
    });
  }

  const payload = { id: data.id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d', // expiration time
  });

  return { token };
} catch (e) {
  throw new GraphQLError('message', {
    extensions: {
      code: 'BAD_EMAIL',
      description: 'The email is already in use',
    },
  });
}
  }

  async registerHost(email, password, nickname, name, inviteCode) {
   
    const res = await Promise.all([
      this.get(`/users?email=${email}&& ${nickname}`),
    ]);
    const [existingEmail, existingNickname] = res;

    if (existingEmail.length) {
      throw new ApolloServerErrorCode.BAD_USER_INPUT('Email is already in use');
    } else if (existingNickname.length) {
      throw new ApolloServerErrorCode.BAD_USER_INPUT(`Username ${existingNickname} already in use`);
    }

    if (!validator.isStrongPassword(password)) {
      throw new GraphQLError('message', {
        extensions: {
          code: 'BAD_PASSWORD',
          description: "The password must be at least 8 characters long and contain a mix of uppercase letters, lowercase letters, numbers, and symbols"
        }
      });
    }
    const user = await this.getUserByEmail(email)

    const passwordHash = await hashPassword(password);
    const newUser = {
      name,
      email,
      password: passwordHash,
      username,
      role: HOST
    };

    try {
      const { data, error } = await this.post(`/users`, newUser);
      if (error) {
        throw new GraphQLError(error.message);
      }
      const payload = { id: data.id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1d' // expiration time
      }).save();
      return { token, userRole };;
    } catch (e) {
      throw new GraphQLError('message', {
        extensions: {
          code: 'BAD_EMAIL',
          description: "The email is already in use"
        }
      });
    }
  }

async getUserByEmail({email}) {
  const email = email.toLowerCase();
    const url = `/user/${email}`;
    console.log(url);
    const result = await this.get(url);
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
    const url = `/user/${email || nickname}`;
    console.log(url);
    const result = await this.get(url);
    return result.data[0];
  }

  updateUser({ userId, userInfo }) {
    return this.patch(`users/${userId}`, { body: { ...userInfo } })
  }
  getUser(userId) {
    return this.get(`user/${userId}`)
  }
  getGalacticCoordinates(userId) {
    return this.get(`users/${userId}/coordinates`);
  }
}

export default AccountsAPI
