import mongoose from './mongoose.mjs';
import User from './models/User.mjs';

async function run() {
  try {
    // Example migration: add a new field to all user documents
    const result = await User.updateMany({}, { $set: { newField: 'defaultValue' } });
    console.log('Migration result:', result);
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
