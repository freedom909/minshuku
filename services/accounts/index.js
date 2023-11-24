import express from 'express';
const app = express();
import { PrismaClient} from '@prisma/client';
const prisma=new PrismaClient()
const port = process.env.PORT || 4011;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// login
app.get('/login/:userId', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.userId },
  });
  if (!user) {
    return res.status(404).send('Could not log in');
  }
  return res.json(user);
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

app.post('/user/', async (req, res) => {
  try {
    const {email} = req.body;
    const user = await prisma.user.findUnique({
      where: { email: email},
    });
    if (!user) {
      return res.status(404).send('Could not find user with this email');
    }
    return res.status(200).json(user);
  } catch (error) {
   return res.status(500).json("server error")
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
      where: { nickname },
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
