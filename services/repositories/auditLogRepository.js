export default class AuditLogRepository {
  constructor({ mongodb }) {
    this.db = mongodb.collection('auditLogs');
  }

  async create({ type, actorUserId, targetUserId, message }) {
    const doc = {
      type,
      actorUserId,
      targetUserId: targetUserId || null,
      message,
      createdAt: new Date().toISOString(),
    };
    await this.db.insertOne(doc);
    return doc;
  }

  async findAll() {
    return await this.db.find({}).sort({ createdAt: -1 }).toArray();
  }
}


