// userRepository.js (or wherever user registration is handled)
import { hashPassword } from '../helpers/passwords.js';

// Example function to create a new user
const createUser = async (userDetails) => {
  const hashedPassword = await hashPassword(userDetails.password);
  const user = {
    ...userDetails,
    password: hashedPassword,
  };
  await db.collection('users').insertOne(user);
  return user;
};
