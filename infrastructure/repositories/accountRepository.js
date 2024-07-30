class AccountRepository {
    constructor(db) {
      this.db = db;
      console.log('db in accountRepository:', this.db);
      if (!db ||typeof db !== 'object') throw new Error('invalid accountRepository');
      this.db=db;
      console.log('db object in accountRepository constructor:',this.db);
      this.collection = db.collection('accounts'); // Ensure you have an 'accounts' collection/table
      this.httpClient=axio.create({
        baseURL:'http://localhost:4001'
      })
    }
  
    async findOne(query) {
      try {
      console.log('query:', query);
      return await this.collection.findOne(query);
    } catch (e) {
      console.error('Error during findOne:', e);
      throw e;
    }
  }

  async findByIdAndUpdate(id, update) {
    return await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: update },
      { returnDocument: 'after' }
    );
  }

  async save(account) {
    const result = await this.collection.insertOne(account);
    if (!result.insertedId) {
      throw new Error('Failed to insert user');
    }
    return { ...account, _id: result.insertedId };
  }

    async getAccountById(id) {
      return await this.db.collection.findOne({ _id: id });
    }
  
    async findByIdAndDelete(id) {
      return await this.collection.findOneAndDelete({ _id: id });
    }

    async getAccountFromDb(id) {
      const query = { _id: new ObjectId("id") };
      return await this.collection.findOne(query);
    }
    async getAccounts() {
      return await this.collection.find().toArray();
    }
  
    async createAccount(account) {
      const result = await this.collection.insertOne(account);
      return result.ops[0];
    }
  
    async deleteAccount(id) {
      return await this.collection.deleteOne({ _id: id });
    }
  
    async updateAccountEmail(id, email) {
      return await this.collection.updateOne({ _id: id }, { $set: { email } });
    }
  
    async updateAccountPassword(id, password) {
      return await this.collection.updateOne({ _id: id }, { $set: { password } });
    }
  }
  
  export default AccountRepository;
  
  