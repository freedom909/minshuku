import express from 'express';
const app = express()

import pkg from 'validator';
const {isEmail } = pkg;
import jwt from 'jsonwebtoken';
import { PrismaClient} from '@prisma/client';
const prisma=new PrismaClient()

const port = process.env.PORT || 4011;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!(password && email)) {
    res.status(401).json({message:'email and password must not be null'})
  }
  if (!isEmail(email)) {
    res.status(401).json({message:'email must be a valid email'})
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

//this code needs to be changed
app.get('/user/:userId/listings', async (req, res) => {
const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
  algorithm: "HS256",
  subject: user.id.toString(),
  expiresIn: "1d"
  });
  return { token, user: user };
}
)
app.post('/user/register', async (req, res) => {
  try {
    const { email, passwordHash, nickname, role, profilePicture,profileDescription } = req.body;
    if (!(password && email && nickname)) {
      res.status(401).json({message:'email, password and nickname must not be null'})
    }
    if (!isEmail(email)) {
      res.status(401).json({message:'email must be a valid email'})
    }
    const user = await prisma.user.findUnique({
      where: { email: email ,nickname: nickname }     
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
          profileDescription: profileDescription,
          name: req.body.name,
          profilePicture: profilePicture,
          role: role,
          password: passwordHash,
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
  const {email,nickname} = req.body;
  let user;
  if (email) {
    user = await prisma.user.findUnique({
      where: { email },
    });
  }else  if (nickname) {
    user=await prisma.user.findUnique({
      where: { nickname }
    })
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

    user.profileDescription = req.body.profileDescription ? req.body.profileDescription : user.profileDescription;

    user.name = req.body.name ? req.body.name : user.name;
  
    user.profilePicture = req.body.profilePicture ? req.body.profilePicture : user.profilePicture;
  
    await user.save();
  
    return res.json(user);
  });
app.listen(port, () => {
  console.log(`UserAccountsAPI running at http://localhost:${port}`);
});
