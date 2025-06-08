import mongoose from 'mongoose';

// MongoDB connection
const mongoDBConnection = await mongoose.connect('mongodb://localhost:27017/air');

// Add this before the syncDataToElasticsearch function
async function syncMongoDBUsersToElasticsearch() {
  try {
    // Fetch users from MongoDB
    const User = mongoose.model('User', new mongoose.Schema({}));
    const users = await User.find({});

    // Index each user in Elasticsearch
    for (let user of users) {
      const transformedUser = {
        // Adjust fields based on your actual user schema
        id: user._id.toString(),
        name: user.name,
        email: user.email
      };
      await esClient.index({ index: 'users_index', id: transformedUser.id, body: transformedUser });
    }
    console.log('MongoDB users synced to Elasticsearch successfully!');
  } catch (error) {
    console.error('Error syncing MongoDB users to Elasticsearch:', error);
  }
}

// Modify the syncDataToElasticsearch call
async function main() {
  await syncDataToElasticsearch();
  await syncMongoDBUsersToElasticsearch();
}

main();
