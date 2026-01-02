import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: String,
    message: String,

    type: {
      type: String,
      enum: ['STATUS', 'ASSIGNMENT', 'REMINDER', 'SYSTEM'],
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
