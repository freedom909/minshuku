import express from 'express';
const app = express();

import { default as validator } from 'validator';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const port = process.env.PORT || 4011;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!(password && email)) {
    return res.status(401).json({ message: 'email and password must not be null' });
  }
  if (!validator.isEmail(email)) {
    return res.status(401).json({ message: 'email must be a valid email' });
  }
  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
  res.json({ token });
});

app.get('/user/:userId', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.userId },
  });
  if (!user) {
    return res.status(404).send('Could not find user with ID');
  }
  return res.json(user);
});

// This code needs to be changed
app.get('/user/:userId/listings', async (req, res) => {
  const userId = req.params.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    return res.status(404).send('Could not find user with ID');
  }
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    subject: user.id.toString(),
    expiresIn: "1d"
  });
  return res.json({ token, user });
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
    if (!validator.isAlphanumeric(nickname)) {
      return res.status(401).json({ message: 'nickname must be alphanumeric' });
    }
    if (!validator.isURL(picture)) {
      return res.status(401).json({ message: 'picture must be a valid URL' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email, nickname: nickname }
    });
    if (user) {
      return res.status(404).send('This email or nickname is already in use');
    }
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
          password: password,
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

app.post('/user', async (req, res) => {
  const { email, nickname } = req.body;
  let user;
  if (email) {
    user = await prisma.user.findUnique({
      where: { email },
    });
  } else if (nickname) {
    user = await prisma.user.findUnique({
      where: { nickname }
    });
  }

  if (!user) {
    return res.status(404).send('Could not find user with this email or nickname');
  }
  return res.json(user);
});

app.patch('/user/:userId', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.userId },
  });
  if (!user) {
    return res.status(404).send('Could not find user with ID');
  }

  // properties to update
  user.profileDescription = req.body.profileDescription || user.profileDescription;
  user.name = req.body.name || user.name;
  user.picture = req.body.picture || user.picture;

  await prisma.user.update({
    where: { id: req.params.userId },
    data: {
      profileDescription: user.profileDescription,
      name: user.name,
      picture: user.picture,
    }
  });

  return res.json(user);
});

app.listen(port, () => {
  console.log(`UserAccountsAPI running at http://localhost:${port}`);
});
