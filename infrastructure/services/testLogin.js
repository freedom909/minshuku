import UserRepository from '../repositories/userRepository.js'; // Adjust the path as necessary
import AuthService from '../repositories/authService.js'; // Adjust the path as necessary


import { connectToDatabase } from '../DB/connectDB.js'; // Adjust the path as necessary

const runTest = async () => {
  const db = await connectToDatabase();
  const userRepository = new UserRepository(db);
  const authService = new AuthService(userRepository);

  try {
    const response = await authService.login({ email: 'example@example.com', password: 'password123' });
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};

runTest();

