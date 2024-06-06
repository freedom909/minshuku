// migrations/add-field-to-users.js

import { connect, disconnect } from 'mongoose';
import { updateMany } from '../models/User';

(async () => {
  await connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Add a new field 'status' to all users
  await updateMany({}, { $set: { status: 'active' } });

  console.log('Migration completed');
  await disconnect();
})();
