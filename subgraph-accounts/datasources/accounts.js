import { RESTDataSource } from '@apollo/datasource-rest';
import { GraphQLError } from 'graphql';
import {hashPassword,checkPassword} from '../helpers/passwords.js'

class AccountsAPI extends RESTDataSource {
    baseURL = 'http://localhost:4011/';

    async login({ email, password }) {
        const user = await this.getUserByEmail(email)
        if (!user) {
            throw new GraphQLError("User with that email does not exist");
        }
        const isValidPassword = await checkPassword(password, user.password)
        if (!isValidPassword) {
            throw new GraphQLError(message, {
                extensions: {
                    code: 'BAD_EMAIL_OR_PASSWORD',
                    description: "Username or password is incorrect"
                }
            })
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            algorithm: "HS256",
            subject: user.id.toString(),
            expiresIn: "1d"
        });
        return { token, userRole:data.role };
    }

    async register(email, password, username) {
       
        const res = await Promise.all([
          this.get(`/users?email=${email}`),
          this.get(`/users?username=${username}`)
        ]);
        const [existingEmail, existingUsername] = res;
      
        if (existingEmail.length) {
          throw new ApolloServerErrorCode.BAD_USER_INPUT('Email is already in use');
        } else if (existingUsername.length) {
          throw new ApolloServerErrorCode.BAD_USER_INPUT('Username already in use');
        }
      
        if (!validator.isStrongPassword(password)) {
          throw new GraphQLError('message', {
            extensions: {
              code: 'BAD_PASSWORD',
              description: "The password must be at least 8 characters long and contain a mix of uppercase letters, lowercase letters, numbers, and symbols"
            }
          });
        }
        
        const passwordHash = await hashPassword(password);
        const user = {
          email,
          password: passwordHash,
          username,
          role:"GUEST"
        };
      
        try {
          const { data, error } = await this.post(`/users`, user);
          if (error) {
            throw new GraphQLError(error.message);
          }
          const payload = { id: data.id };
          const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1d' // expiration time
          }).save();
          return { token };
        } catch (e) {
          throw new GraphQLError('message', {
            extensions: {
              code: 'BAD_EMAIL',
              description: "The email is already in use"
            }
          });
          return data;
        }
      }
      
    updateUser({ userId, userInfo }) {
        return this.patch(`user/${userId}`, { body: { ...userInfo } })
    }
    getUser(userId) {
        return this.get(`user/${userId}`)
    }
    getGalacticCoordinates(userId) {
        return this.get(`user/${userId}/coordinates`);
    }
}
export default AccountsAPI