import { hashPassword, checkPassword } from '../helpers/passwords.js';
import GraphError from 'graphql';
import { ForbiddenError } from '../utils/errors.js';

class AccountService {
  constructor(accountRepository, listingRepository) {
    this.accountRepository = accountRepository;
    this.listingRepository = listingRepository;
  }

  async getUser(id) {
    // Fetch user by ID from the database
    const user = await this.accountRepository.getAccountById(id);
    if (!user) {
      throw new GraphError('User not found', 'NOT_FOUND');
    }

    return user;
  }

  async getBookingsForUser(user) {
    // Fetch bookings for a specific user
    if (!user) {
      throw new GraphError('No user found', 'NOT_FOUND');
    }
    const bookings = await this.accountRepository.getBookingsForUser(user);
    return bookings;

    // Implement the logic here
  }
  async createAccount({ email, password, name, nickname, role, picture }) {
    // Validation logic
    const existingUser = await this.accountRepository.findOne({ nickname });
    if (existingUser) {
      throw new ForbiddenError('Nickname is already in use, please use another one', 'BAD_USER_INPUT');
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

  async getBookingById(id) {
    try {
      return await this.accountRepository.findById(id);
    } catch (error) {
      throw new GraphError('Failed to fetch booking', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async getListingsForHost(hostId) {
    try {
      return await this.listingRepository.getListingsForHost(hostId);
    } catch (error) {
      throw new GraphError('Failed to fetch listings', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }
  // Implement other methods like login, updatePassword, etc.
  async getAccountById(id) {
    return await this.accountRepository.getAccountById(id);
  }
  async getAccounts() {
    return await this.accountRepository.getAccounts();
  }

  async createListing({ title, description, photoThumbnail, numOfBeds, costPerNight, locationType, amenities, hostId }) {
    // Validate inputs if necessary
    if (!title || !description || !photoThumbnail || !numOfBeds || !costPerNight || !locationType || !amenities || !hostId) {
      throw new Error("All listing details must be provided");
    }
    const user = await this.accountRepository.getAccountById(hostId);
    if (!user || user.role!== 'HOST') {
      throw new Error("Only hosts can create listings");
    }
    return await this.listingRepository.createListing({ title, description, photoThumbnail, numOfBeds, costPerNight, locationType, amenities, hostId });
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

  async updateAccountRole(id, role) {
    return await this.accountRepository.updateAccountRole(id, role);
  }
  async updateAccountPicture(id, picture) {
    return await this.accountRepository.updateAccountPicture(id, picture);
  }
  async updateAccountProfile(id, bio) {
    return await this.accountRepository.updateAccountBio(id, profile);
  }
  async createUser({ name, email, password }) {
    // Create a new user in the database
    const user = {
      name,
      email,
      password, // Ensure password is hashed before storing
      createdAt: new Date(),
    };
    return await this.accountRepository.createUser(user);
}

  async deleteUser(id) {
    // Delete a user from the database
    return await this.accountRepository.deleteUser(id);
  }
  async updateUserEmail(id, email) {
    // Update the email of a user in the database
    return await this.accountRepository.updateUserEmail(id, email);
  }
  async updateUserPassword(id, password) {
    // Update the password of a user in the database
    return await this.accountRepository.updateUserPassword(id, password); // Ensure password is hashed before updating
  }
  async updateUser({ userId, userInfo }) {
    // Update user information in the database
    return await this.accountRepository.updateUser(userId, userInfo);
   
  }
}

export default AccountService;
