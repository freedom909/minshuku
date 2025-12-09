import { GraphQLError } from 'graphql';

export default class AccountService {
  constructor({ userRepository, auditLogRepository, logger,tokenService  }) {

    this.userRepository = userRepository;
    this.auditLogRepository = auditLogRepository;
    this.logger = logger || console;
    this.tokenService = tokenService;
  }

  // List all users
  async listAllUsers() {
    return this.userRepository.findAll();
  }

  // List users by role
  async listUsersByRole(role) {
    return this.userRepository.findUsersByRole(role);
  }

  // Approve / verify host
  async approveHost(userId, adminId) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    if (user.role !== 'PENDING_HOST') {
      throw new Error('User is not a pending host');
    }

    user.role = 'HOST';
    await this.userRepository.save(user);

    await this.auditLogRepository.create({
      type: 'APPROVE_HOST',
      actorUserId: adminId,
      targetUserId: userId,
      message: `Host approved by admin ${adminId}`,
      createdAt: new Date().toISOString(),
    });

    return { success: true, message: 'Host approved', user };
  }

  // Lock user account
  async lockUser(userId, adminId) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    user.locked = true;
    await this.userRepository.save(user);

    await this.auditLogRepository.create({
      type: 'LOCK_USER',
      actorUserId: adminId,
      targetUserId: userId,
      message: `User locked by admin ${adminId}`,
      createdAt: new Date().toISOString(),
    });

    return { success: true, message: 'User locked', user };
  }

  // Unlock user account
  async unlockUser(userId, adminId) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    user.locked = false;
    await this.userRepository.save(user);

    await this.auditLogRepository.create({
      type: 'UNLOCK_USER',
      actorUserId: adminId,
      targetUserId: userId,
      message: `User unlocked by admin ${adminId}`,
    });

    return { success: true, message: 'User unlocked', user };
  }

  // Issue admin token (example JWT)
  async issueAdminToken(adminId) {
    if (!this.tokenService) {
      throw new Error("tokenService not registered in container");
    }
    
    const user = await this.userRepository.findById(adminId);
    if (!user || user.role !== 'ADMIN') throw new Error('Not an admin');

    const token = await tokenService.generateToken({ id: adminId });
    return { token, expiredAt: tokenService.getExpiry() };
  }

  // Audit logs
  async auditLogs() {
    return this.auditLogRepository.findAll();
  }
}



