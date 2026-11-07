import mongoose from "mongoose";

const RateLimitSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true },
    count: Number,
    expiraEn: { type: Date, index: { expires: 0 } },
  },
  { timestamps: true }
);

export default mongoose.models.RateLimit || mongoose.model("RateLimit", RateLimitSchema);
