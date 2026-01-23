import mongoose from "mongoose";

const rewardHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "COMPLAINT_VERIFIED",
        "COMPLAINT_RESOLVED",
        "FEEDBACK_GIVEN",
      ],
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("RewardHistory", rewardHistorySchema);
