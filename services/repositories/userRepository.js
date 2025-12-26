import { ObjectId } from 'mongodb';

class UserRepository {
  constructor({ mongodb }) {
    this.collection = mongodb.collection('users');
  }

  async getUserById(id) {
    if (!ObjectId.isValid(id)) {
      return null; // Or throw an error for invalid ID format
    }
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  async getUserByEmailFromDb(email) {
    return await this.collection.findOne({ email });
  }

  async save(user) {
    const result = await this.collection.insertOne(user);
    return { _id: result.insertedId, ...user };
  }

  async findByOAuth(provider, providerAccountId) {
    return await this.collection.findOne({
      'oauth.provider': provider,
      'oauth.providerAccountId': providerAccountId,
    });
  }

 async findByEmail(email) {
    return await this.collection.findOne({ email });
  }

 async findAll() {
    return await this.collection.find({}).toArray();
  }

  async findUsersByRole(role) {
    return await this.collection.find({ role }).toArray();
  }

async create(data) {
    return {
      id: "debug-user-id", // ✅ 必须
      email: data.email,
      role: data.role ?? "USER",
    };
  }

  async updateUserRole(userId, newRole) {
    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid userId format');
    }
    const result = await this.collection.findOneAndUpdate( // Use findOneAndUpdate for atomic update and returning the updated document
     { _id: new ObjectId.createFromTime(Number(userId)) },

      { $set: { role: newRole } },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) {
      return null; // Or throw an error for invalid ID format
    }
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  // Add other necessary repository methods here if they don't exist
  // For example:
  async findOne(query) {
    return await this.collection.findOne(query);
  }
}

export default UserRepository;