import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { validateInviteCode } from '../../infrastructure/helpers/validateInvitecode.js';
import { validationResult } from 'express-validator';
import { validLogin, validRegister } from '../../infrastructure/helpers/valid.js';
import { checkPassword } from '../../infrastructure/helpers/passwords.js';
import UserService from './datasources/userService.js';
import User from '../../infrastructure/models/user.js';
import mongoose from 'mongoose';

dotenv.config();
const router = express.Router();
router.use(express.json());

const userService = new UserService();

router.get('/', (req, res) => {
  res.send('Hello World!');
});

router.post('/registerHost', async (req, res) => {
  try {
    const { email, password, name, nickname, inviteCode, picture } = req.body;
    const isValidInviteCode = await validateInviteCode(inviteCode);
    if (!isValidInviteCode) {
      return res.status(400).json({ error: 'Invalid invite code' });
    }

    const result = await userService.register({ email, password, name, nickname, role: 'HOST', picture });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/registerGuest',
   async (req, res) => {
  try {
    const { email, password, name, nickname, picture } = req.body;
    const result = await userService.register({ email, password, name, nickname, role: 'GUEST', picture });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', validLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const result = await userService.login({ email, password });
    res.json(result);
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

main().catch(console.error);
