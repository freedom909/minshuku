import express from 'express';
import { shield, rule, and, or } from 'graphql-shield'
import { default as validator } from 'validator';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import auth from './auth.js';
import permissions from './permissions.js';
import { applyMiddleware } from 'graphql-middleware';

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 4011;
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello World!');
});


// login
app.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  if (!(password && email)) {
    return res.status(401).json({ message: 'Email and password must not be null' });
  }
  if (!validator.isEmail(email)) {
    return res.status(401).json({ message: 'Email must be a valid email' });
  }
  if (password.length < 8) {
    return res.status(401).json({ message: 'Password must be at least 8 characters' });
  }
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email' });
  }
  next();
});

app.get('/user/:userId', auth.authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.userId },
  });
  if (!user) {
    return res.status(404).send('Could not find user with ID');
  }
  return res.json(user);
});

// Get listings by user ID
app.get('/user/:userId/listings', auth.authenticate, auth.authorize(permissions.listingsWithPermission), async (req, res) => {
  const listings = await prisma.listing.findMany({
    where: { hostId: req.user.id }
  });
  return res.json(listings);
});

// Create a listing
app.post('/user/:userId/listings', auth.authenticate, auth.authorize(permissions.listingsWithPermission), async (req, res) => {
  const { title, description, price, location } = req.body;
  const listing = await prisma.listing.create({
    data: {
      title,
      description,
      price,
      location: {
        create: location
      },
      host: {
        connect: {
          id: req.user.id
        }
      }
    }
  });
  return res.json(listing);
});
app.post('/register', async (req, res) => {
  try {
    const { email, password, nickname, role, picture, description } = req.body;
    if (!(password && email && nickname)) {
      return res.status(401).json({ message: 'email, password and nickname must not be null' });
    }
    if (!validator.isEmail(email)) {
      return res.status(401).json({ message: 'email must be a valid email' });
    }
    if (password.length < 8) {
      return res.status(401).json({ message: 'password must be at least 8 characters' });
    }
    if (!validator.isStrongPassword(password)) {
      return res.status(401).json({ message: 'The password must be at least 8 characters long and contain a mix of uppercase letters, lowercase letters, numbers, and symbols' });
    }
    if (nickname.length < 3) {
      return res.status(401).json({ message: 'nickname must be at least 3 characters' });
    }
    if (!validator.isURL(picture)) {
      return res.status(401).json({ message: 'picture must be a valid URL' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email, nickname: nickname }
    });
    if (existingUser) {
      return res.status(404).send('This email or nickname is already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let newUser;
    if (role === "GUEST" || role === "HOST") {
      newUser = await prisma.user.create({
        data: {
          email: email,
          nickname: nickname,
          description: description,
          name: req.body.name,
          picture: picture,
          role: role,
          password: hashedPassword,
        },
      });

    } else {
      return res.status(400).send('Invalid user role');
    }

    return res.status(200).json(newUser);
  } catch (error) {
    return res.status(500).json("Server error");
  }
});


app.patch('/user/:userId', auth.authenticate, async (req, res) => {
  try {
    const {description,name,picture} = req.body
    const updateUser = await prisma.user.update({
      where: { id: req.params.userId },
      data: {
       description: description,
        name: name,
        picture: picture,
      }
    })
  } catch (error) {
    return res.status(500).json({message:"internal server error"})
  }
});

app.listen(port, () => {
  console.log(`UserAccountsAPI running at http://localhost:${port}`);
})

