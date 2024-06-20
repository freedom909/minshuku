import { GraphQLError } from 'graphql';
import { validRegister, validLogin } from '../../infrastructure/helpers/valid.js';
import { hashPassword, checkPassword } from '../../infrastructure/helpers/passwords.js';
import UserRepository from '../../infrastructure/userRepository.js';
import pkg from 'jsonwebtoken';
const { sign } = pkg;

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register({ email, password, name, nickname, role, picture }) {
    if (validRegister({ email, password, name, nickname, role, picture })) {
      const existingUser = await this.userRepository.getUserByNicknameFromDb(nickname);
      if (existingUser) {
        throw new GraphQLError('Nickname is already in use, please use another one', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        });
      }

      const passwordHash = await this.userRepository.hashPassword(password);
      const newUser = {
        email,
        name,
        password: passwordHash,
        nickname,
        role,
        picture
      };

      try {
        const result = await this.userRepository.insertUser(newUser);
        if (!result.insertedId) {
          throw new Error('Failed to insert user');
        }

        const payload = { _id: result.insertedId };
        const token = await this.userRepository.generateToken(payload);
        await this.userRepository.sendVerificationEmail(email, token);

        return { ...newUser, _id: result.insertedId, token };
      } catch (e) {
        console.error('Registration error:', e);
        throw new GraphQLError('Email is already in use or an internal server error occurred', {
          extensions: {
            code: 'SERVER_ERROR'
          }
        });
      }
    }
  }

  async login({ email, password }) {
    if (validLogin(email, password)) {
      const existingUser = await this.userRepository.getUserByEmailFromDb(email);
      if (!existingUser) {
        throw new GraphQLError('User does not exist', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        });
      }

      const passwordMatch = await this.userRepository.checkPassword(password, existingUser.password);
      if (!passwordMatch) {
        throw new GraphQLError('Incorrect password', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        });
      }

      const payload = { id: existingUser._id };
      const token = this.userRepository.generateToken(payload);

      return { token };
    }
  }
}

async function initializeServices(db) {
  const userRepository = new UserRepository(db);
  const userService = new UserService(userRepository);
  return { userService };
}

export default UserService;
export { initializeServices };


