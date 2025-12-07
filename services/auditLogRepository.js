import AuditLog from './models/auditLog.js';

class AuditLogRepository {
  constructor() {
    this.model = AuditLog;
  }

  /**
   * Create an audit log entry
   * @param {Object} logData
   * @param {String} logData.userId
   * @param {String} logData.action
   * @returns {Promise<Object>}
   */
  async create({ userId, action }) {
    const log = new this.model({
      userId,
      action,
    });
    return await log.save();
  }

  /**
   * Get all audit logs (supports pagination in future)
   * @returns {Promise<Array>}
   */
  async findAll() {
    return await this.model.find().sort({ timestamp: -1 }).lean();
  }
}

export default AuditLogRepository;
