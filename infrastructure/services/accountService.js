import { hashPassword, checkPassword } from '../helpers/passwords.js';
import { handleGraphQLError } from '../utils/errors.js';

class AccountService {
  constructor(accountRepository) {
    this.accountRepository = accountRepository;
  }

  async createAccount({ email, password, name, nickname, role, picture }) {
    // Validation logic
    const existingUser = await this.accountRepository.findOne({ nickname });
    if (existingUser) {
      handleGraphQLError('Nickname is already in use, please use another one', 'BAD_USER_INPUT');
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      email,
      name,
      password: passwordHash,
      nickname,
      role,
      picture,
    };

    try {
      const result = await this.accountRepository.save(newUser);
      return result;
    } catch (e) {
      console.error('Registration error:', e);
      handleGraphQLError('Email is already in use or an internal server error occurred', 'SERVER_ERROR');
    }
  }

  // Implement other methods like login, updatePassword, etc.
  async getAccountById(id) {
    return await this.accountRepository.getAccountById(id);
  }
  async getAccounts() {
    return await this.accountRepository.getAccounts();
  }
  async createAccount({ email, password }) {
    const account = {
      email,
      password, // Ensure password is hashed before storing
      createdAt: new Date(),
    };
    return await this.accountRepository.createAccount(account);
  }

  async deleteAccount(id) {
    return await this.accountRepository.deleteAccount(id);
  }

  async updateAccountEmail(id, email) {
    return await this.accountRepository.updateAccountEmail(id, email);
  }

  async updateAccountPassword(id, password) {
    return await this.accountRepository.updateAccountPassword(id, password); // Ensure password is hashed before updating
  }
}

export default AccountService;
