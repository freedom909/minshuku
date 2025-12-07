import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },            // e.g. HOST_APPROVED
    actorUserId: { type: String, required: true },      // admin who did the action
    targetUserId: { type: String, default: null },      // optional (the affected user)
    message: { type: String, required: true },          // readable log text
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Expose id mapped from _id
auditLogSchema.virtual("id").get(function () {
  return this._id.toString();
});

auditLogSchema.set("toJSON", { virtuals: true });

export default mongoose.model("AuditLog", auditLogSchema);
