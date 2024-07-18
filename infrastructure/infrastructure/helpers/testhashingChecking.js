// testPasswords.js
import { hashPassword, checkPassword } from '../helpers/passwords.js';

const testPasswordFunctions = async () => {
  const plainPassword = 'password123';
  const hashedPassword = await hashPassword(plainPassword);

  console.log('Plain Password:', plainPassword);
  console.log('Hashed Password:', hashedPassword);

  const isMatch = await checkPassword(plainPassword, hashedPassword);
  console.log('Do the passwords match?', isMatch);
};

testPasswordFunctions();
