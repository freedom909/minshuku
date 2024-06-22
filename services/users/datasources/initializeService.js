import UserService from "./userService";
import UserRepository from "../../infrastructure/userRepository";
async function initializeServices() {
    const db = await connectToDatabase();
    const userService = new UserService(new UserRepository({db}));
    return { userService };
  }