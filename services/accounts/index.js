import dotenv from 'dotenv';
import express from 'express';
import { connectToDatabase } from '../../infrastructure/DB/connectDB.js';
import pkg from '../users/userService.js';
const initializeServices = pkg;
import  AccountsAPI  from './datasources/accountsApi.js';
import router from './app.js';

dotenv.config();
const app = express();
app.use(express.json());

async function startServer() {
  const db = await connectToDatabase();
  const { userService, accountsAPI } = new initializeServices({db});

  app.use((req, res, next) => {
    req.userService = userService;
    req.accountsAPI = accountsAPI;
    next();
  });

  app.use(router);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});



