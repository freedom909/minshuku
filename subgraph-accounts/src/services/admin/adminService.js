// src/services/adminService.js
import jwt from "jsonwebtoken";

export default class AdminService {
  constructor({
    userRepository,
    auditLogRepository,
    logger,
    secretKey,
    expiresIn,
  }) {
    this.userRepository = userRepository;
    this.auditLogRepository = auditLogRepository;
    this.logger = logger || console;
    this.jwtSecret = secretKey;
    this.jwtExpiresIn = expiresIn || "1h";
  }

  // ============================================================
  // Utility: Write Audit Log
  // ============================================================
  async writeLog({ actorUserId, targetUserId, type, message }) {
    await this.auditLogRepository.create({
      type,
      actorUserId,
      targetUserId,
      message,
      createdAt: new Date(),
    });
  }

  // ============================================================
  // LIST ALL USERS
  // ============================================================
  async getAllUsers() {
    return await this.userRepository.findAll();
  }

  // ============================================================
  // PENDING HOST LIST
  // ============================================================
  async getPendingHosts() {
    return await this.userRepository.findByRole("PENDING_HOST");
  }

  // ============================================================
  // APPROVE HOST
  // ============================================================
  async approveHost(userId, actorUserId = "ADMIN") {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "PENDING_HOST") {
      throw new Error("This user is not in PENDING_HOST state");
    }

    user.role = "HOST";
    await user.save();

    await this.writeLog({
      actorUserId,
      targetUserId: userId,
      type: "APPROVE_HOST",
      message: `Host verified for user: ${user.email}`,
    });

    return {
      code: 200,
      success: true,
      message: "Host approved",
      user,
    };
  }

  // ============================================================
  // FORCE VERIFY HOST (admin override)
  // ============================================================
  async forceVerifyHost(userId, actorUserId = "ADMIN") {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    user.role = "HOST";
    await user.save();

    await this.writeLog({
      actorUserId,
      targetUserId: userId,
      type: "FORCE_VERIFY_HOST",
      message: `Force-verified host: ${user.email}`,
    });

    return {
      code: 200,
      success: true,
      message: "Host force-verified",
      user,
    };
  }

  // ============================================================
  // LOCK USER
  // ============================================================
  async lockUser(userId, actorUserId = "ADMIN") {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    user.isLocked = true;
    await user.save();

    await this.writeLog({
      actorUserId,
      targetUserId: userId,
      type: "LOCK_USER",
      message: `User locked: ${user.email}`,
    });

    return user;
  }

  // ============================================================
  // UNLOCK USER
  // ============================================================
  async unlockUser(userId, actorUserId = "ADMIN") {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    user.isLocked = false;
    await user.save();

    await this.writeLog({
      actorUserId,
      targetUserId: userId,
      type: "UNLOCK_USER",
      message: `User unlocked: ${user.email}`,
    });

    return user;
  }

  // ============================================================
  // ADMIN TOKEN (JWT)
  // ============================================================
  async issueAdminToken(adminId) {
    const token = jwt.sign(
      { sub: adminId, role: "ADMIN" },
      this.jwtSecret,
      {
        expiresIn: this.jwtExpiresIn,
      }
    );

    return {
      token,
      expiredAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  }

  // ============================================================
  // AUDIT LOGS
  // ============================================================
  async getAuditLogs() {
    return await this.auditLogRepository.findAll();
  }
}
