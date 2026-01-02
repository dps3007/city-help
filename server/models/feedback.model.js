import mongoose, { Schema } from 'mongoose';

const feedbackSchema = new Schema(
  {
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
      unique: true,
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Feedback', feedbackSchema);
