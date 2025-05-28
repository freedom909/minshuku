import { getToken } from "next-auth/jwt"; // if you're using NextAuth
import connectToMongoDB from '../../../../../services/DB/connectMongoDB';
import User from '../../../../../services/models/user';

export default async function handler(req, res) {
  const token = await getToken({ req });

  if (!token || token.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await connectToMongoDB();

  if (req.method === 'GET') {
    try {
      const users = await User.find({}, 'name email'); // Only return safe fields
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
