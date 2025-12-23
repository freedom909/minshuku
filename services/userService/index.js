//services/userService/index.js

import validateLoginResponse from "./utils/validateLoginResponse.js";
import { GraphQLError } from 'graphql';


class UserService {
  constructor({ localAuthService, userRepository, passwordHasher, tokenService, accountLockService,oauthService }) {
    this.localAuthService = localAuthService;
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
    this.accountLockService = accountLockService;
    this.oauthService = oauthService;
  }

  async localLogin(email, password) {
    console.log('Starting local login process for email:', email);

    if (!this.localAuthService) {
      throw new GraphQLError('Local authentication service is not configured', {
        extensions: { code: 'SERVICE_UNAVAILABLE' }
      });
    }
    return await this.localAuthService.localLogin(email, password);
  }



  async oauthLogin(provider, token) {
    console.log("Authenticating with provider:", provider); 
    console.log("Token received:", token);
    return await this.oauthService.authenticate(provider, token);
  }

  async getUserById(id) {
    if (!id) {
      throw new GraphQLError('User ID is required', { extensions: { code: 'BAD_USER_INPUT' } });
    }
    try {
      return await this.userRepository.getUserById(id);
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw new GraphQLError('Failed to fetch user', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async findUsersByRole(role) {
    if (!role) {
      throw new GraphQLError('Role is required', { extensions: { code: 'BAD_USER_INPUT' } });
    }
    try {
      return await this.userRepository.findUsersByRole(role);
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw new GraphQLError('Failed to fetch users by role', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async updateUserRole(userId, newRole) {
    if (!userId || !newRole) {
      throw new GraphQLError('User ID and new role are required', { extensions: { code: 'BAD_USER_INPUT' } });
    }
    const validRoles = ['ADMIN', 'HOST', 'GUEST', 'USER', 'PENDING_HOST'];
    if (!validRoles.includes(newRole)) {
      throw new GraphQLError(`Invalid role: ${newRole}`, { extensions: { code: 'BAD_USER_INPUT' } });
    }

    try {
      return await this.userRepository.updateUserRole(userId, newRole);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new GraphQLError('Failed to update user role', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

async findOrCreateOAuthUser({ provider, oauthId, email, name, picture }) {
    let user = await this.userRepository.findByProvider(provider, oauthId);

    if (!user) {
      user = await this.userRepository.create({
        provider,
        oauthId,
        email,
        name,
        picture,
        role: 'GUEST',
      });
    }
    return user;
  }

  async handleGoogleOAuth(token) {
    return await this.oauthService.handleGoogleOAuth(token);
  }
}

export default UserService;
