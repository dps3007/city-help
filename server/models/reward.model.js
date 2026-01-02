import mongoose, { Schema } from 'mongoose';

const rewardSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    points: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      enum: [
        'COMPLAINT_CREATED',
        'UPVOTE_RECEIVED',
        'FEEDBACK_GIVEN',
        'RESOLUTION_CONFIRMED',
      ],
      required: true,
    },

    complaintId: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Reward', rewardSchema);
