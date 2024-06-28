import pkg from 'mongodb';
const { MongoClient } = pkg;
import UserRepository from '../repositories/userRepository.js';

async function main() {
  const uri = 'mongodb+srv://chika:13GhspHKakjX4UPx@cluster0.lidru.mongodb.net/<dbname>?retryWrites=true&w=majority';
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db('air');
    const userRepository = new UserRepository(db);

    const newUser = {
      email: 'example@example.com',
      name: 'John Doe',
      password: 'hashedpassword',
      nickname: 'johndoe',
      role: 'GUEST',
      picture: 'profile.jpg'
    };

    const result = await userRepository.insertUser(newUser);
    console.log('User successfully inserted:', result);

    const user = await userRepository.findOne({ email: 'example@example.com' });
    console.log('Found user:', user);

  } finally {
    await client.close();
  }
}

main().catch(console.error);
