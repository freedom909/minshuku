import express, { json } from 'express';
import { verify } from 'jsonwebtoken';
import { hash } from 'bcrypt';
import { User } from './models'; // Assuming you have a User model
import { generateInviteCode } from '../infrastructure/helpers/generateInviteCode.js';
import { requireAuth, requireRole } from '../infrastructure/auth/authAndRole.js';

import { getToken } from '../infrastructure/helpers/getToken.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(json());

app.get('/', (req, res) => {
  existingToken = getToken(req)
if (existingToken) {
   // Redirect to a specific route (e.g., dashboard)
   return res.redirect('/dashboard'); // Change the destination as needed
  }  
  res.send('Hello World!');
});
app.use((req, res, next) => {
  req.user = {
    id: '123456',
    role: 'HOST' // or 'ADMIN' or 'GUEST'
  };
  next();
});

// Reset Password
app.post('/api/reset-password', requireAuth, async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    const hashedPassword = await hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Generate Invite Code
app.post('/generate-invite-code', requireRole(['HOST', 'ADMIN']), async (req, res) => {
  const userId = req.body.userId;
  try {
    const inviteCode = await generateInviteCode(userId);
    res.json({ inviteCode });
  } catch (error) {
    res.status(500).json({ error: 'Error generating invite code' });
  }
});

// Register
app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Add validation here for registration inputs
    const hashedPassword = await hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword, name });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// User Profile
app.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Update password
app.get('/updatePassword', requireAuth, (req, res) => {
  const existingToken = getToken(req);
  if (existingToken) {
    // Assuming you want to redirect to a form for updating the password
    return res.redirect('/updatePasswordForm'); // Change the destination as needed
  }
  res.redirect('/login');
});
// Start your server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

