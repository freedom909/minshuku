import pkg from 'mongodb';
const { MongoClient } = pkg;
import UserRepository from '../repositories/userRepository.js';
import UserService from '../services/userService.js';
import initializeServices from './initService.js';
import loginValidate from '../helpers/loginValidator.js';

async function main1() {
  const uri = 'mongodb+srv://chika:13GhspHKakjX4UPx@cluster0.lidru.mongodb.net/<dbname>?retryWrites=true&w=majority';
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db('air');
    const userRepository = new UserRepository(db);

    const newUser = {
      email: 'example@example.com',
      name: 'John Doe',
      password: 'hashedpassword',
      nickname: 'johndoe',
      role: 'GUEST',
      picture: 'profile.jpg'
    };

    const result = await userRepository.insertUser(newUser);
    console.log('User successfully inserted:', result);

    const user = await userRepository.findOne({ email: 'example@example.com' });
    console.log('Found user:', user);

  } finally {
    await client.close();
  }
}


async function main2() {
  const uri = 'mongodb+srv://chika:13GhspHKakjX4UPx@cluster0.lidru.mongodb.net/air?retryWrites=true&w=majority';
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await loginValidate(email, password)
  try {
    await client.connect();
    const db = client.db('air');
    const userRepository = new UserRepository(db);
    const userService = new UserService(userRepository);
    const usLogin=await userService.login({ email: "just4@gmail.com", password: "cc17b44ada" });
    console.log('Login result:', usLogin);

    const {token, userId,role}=usLogin;
    console.log('Found user:', 'token',token,'userId',userId,'role',role);
  
    
    if (user) {
      const existingUserLogin = await userService.login({ email: "just4@gmail.com", password: "cc17b44ada" });
      console.log('Login result:', existingUserLogin);

    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}
main2().catch(console.error);
