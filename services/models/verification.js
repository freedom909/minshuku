import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userId: String,
  frontKey: String,
  backKey: String,
  selfieKey: String,
  faceMatched: Boolean,
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING"
  }
}, { timestamps: true });

export default mongoose.model("Verification", schema);
