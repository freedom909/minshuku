import UserRepository from './repositories/userRepository.js'
import UserService from './userService.js';
import dotenv from 'dotenv';
dotenv.config();

async function initializeServices() {
  try {
    // 移除 MongoDB 连接逻辑
    const userRepository = new UserRepository({}); 
    const userService = new UserService(userRepository);

    return { userService };
  } catch (error) {
    console.error('Error initializing services:', error);
    throw new Error('Failed to initialize services');
  }
}

export default initializeServices;