class AccountRepository {
    constructor(db) {
      this.db = db;
      this.collection = db.collection('accounts'); // Ensure you have an 'accounts' collection/table
    }
  
    async getAccountById(id) {
      return await this.collection.findOne({ _id: id });
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
  
  