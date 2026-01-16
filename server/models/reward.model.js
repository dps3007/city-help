import mongoose, { Schema } from "mongoose";

const rewardSchema = new Schema(
  {
    // Who receives the reward
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Reward points (non-monetary)
    points: {
      type: Number,
      required: true,
      min: 1,
    },

    // Why the reward was given
    reason: {
      type: String,
      enum: [
        "COMPLAINT_VERIFIED",   // complaint validated by officer/admin
        "COMPLAINT_RESOLVED",   // complaint successfully resolved
        "FEEDBACK_GIVEN",       // citizen submitted feedback
        "UPVOTE_RECEIVED",      // optional: community validation
      ],
      required: true,
    },

    // Related complaint (if applicable)
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

rewardSchema.index(
  { userId: 1, reason: 1, complaintId: 1 },
  { unique: true }
);


export default mongoose.model("Reward", rewardSchema);
