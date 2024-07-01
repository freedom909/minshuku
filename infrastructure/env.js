import dotenv from 'dotenv';
import UserService from './services/userService';

dotenv.config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);
const ns=new UserService()
ns.
