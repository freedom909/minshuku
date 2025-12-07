import jwt from "jsonwebtoken";
import User from "../services/models/user.js";
import AuditLog from "../services/models/auditLog.js";

export default {
  Query: {
    users: async () => User.find(),
    user: async (_, { id }) => User.findById(id),
    auditLogs: async () => AuditLog.find().sort({ createdAt: -1 }),
  },

  Mutation: {
    forceVerifyHost: async (_, { userId }, { admin }) => {
      if (!admin) throw new Error("Admin only");

      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      user.isVerified = true;
      user.role = "host";
      await user.save();

      await AuditLog.create({
        type: "FORCE_VERIFY",
        actorUserId: admin.id,
        targetUserId: user.id,
        message: `Admin force-verified host ${user.email}`
      });

      return user;
    },

    lockUser: async (_, { userId }, { admin }) => {
      if (!admin) throw new Error("Admin only");

      const user = await User.findById(userId);
      user.isLocked = true;
      await user.save();

      await AuditLog.create({
        type: "LOCK",
        actorUserId: admin.id,
        targetUserId: user.id,
        message: `Account locked`
      });

      return user;
    },

    unlockUser: async (_, { userId }, { admin }) => {
      if (!admin) throw new Error("Admin only");

      const user = await User.findById(userId);
      user.isLocked = false;
      await user.save();

      await AuditLog.create({
        type: "UNLOCK",
        actorUserId: admin.id,
        targetUserId: user.id,
        message: `Account unlocked`
      });

      return user;
    },

    issueAdminToken: async (_, { adminId }) => {
      const admin = await User.findById(adminId);

      if (!admin || admin.role !== "admin") {
        throw new Error("Not an admin");
      }

      const token = jwt.sign(
        { id: admin.id, role: "admin" },
        process.env.ADMIN_JWT_SECRET,
        { expiresIn: "1d" }
      );

      return {
        token,
        expiredAt: new Date(Date.now() + 86400000).toISOString()
      };
    },
  },
};
