import BaseAPI from '../../../infrastructure/datasources/BaseAPI.js';

class AccountsAPI extends BaseAPI {
  constructor() {
    super('http://localhost:4000/');
  }

  async getAccountById(id) {
    return this.get(`accounts/${id}`);
  }

  async getAccounts() {
    return this.get('accounts');
  }

  async createAccount(email, password) {
    return this.post('accounts', { email, password });
  }

  async deleteAccount(id) {
    return this.delete(`accounts/${id}`);
  }

  async updateAccountEmail(id, email) {
    return this.put(`accounts/${id}/email`, { email });
  }

  async updateAccountPassword(id, newPassword, password) {
    return this.put(`accounts/${id}/password`, { newPassword, password });
  }
}

export default AccountsAPI;
