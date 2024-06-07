// services/accounts/index.js
import express, { json } from 'express';
import db from './models/index.js'; // Assuming you have models defined here
import { Op } from '@sequelize/core';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { validRegister, validLogin } from './valid.js';
import { hashedPassword, checkPassword } from './password.js';
import { getToken } from './token.js';
import { validationResult } from 'express-validator';

dotenv.config();

app.get("/", (req, res) => {
    res.send("Hello World!");
  });
const { User } = db;
const router = express.Router();

// Middleware to parse JSON
router.use(json());

// Example route to register a new user
app.post('/register', async (req, res) => {
    try {
        if (!getToken(req, res)) {
            const { email, password, name } = req.body;

            if (validRegister(email, password)) {
                // Hash the password
                const hashedPassword = await hashPassword(password);
                // Create a new user
                const newUser = await User.create({
                    email,
                    password: hashedPassword,
                    name,
                });

                // Return the new user
                res.status(201).json(newUser);
            } else {
                res.status(400).json({ error: 'Invalid registration details' });
            }
        } else {
            res.status(403).json({ error: 'Token already exists' });
        }
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Example route to login a user
app.post('/login', validLogin, async (req, res) => {
    try {
        // Check if the request already contains a token
        const existingToken = getToken(req);
        if (existingToken) {
            // Redirect to a specific route (e.g., dashboard)
            return res.redirect('/dashboard'); // Change the destination as needed
        }

        const { email, password } = req.body;

        // Validate login credentials
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Find the user by email
        const user = await User.findOne({ where: { email } });
        if (!user || !(await checkPassword(password, user.password))) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate a new token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Example route to get user profile
router.get('/profile', async (req, res) => {
    try {
        // Check if the request already contains a token
        const token = getToken(req);
        if (!token) {
            return res.status(401).json({ error: 'You must be logged in to access this route' });
        }

        // Decode the token to get the userId
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { userId } = decoded;

        // Find the user by id
        const user = await User.findByPk(userId);

        // If user is not found, return 404 error
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return the user profile
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
