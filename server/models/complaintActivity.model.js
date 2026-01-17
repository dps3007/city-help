import mongoose, { Schema } from 'mongoose';

// Enums
const STATUS_ENUM = [
  'SUBMITTED',
  'VERIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
];

// Complaint Activity Schema
const complaintActivitySchema = new Schema(
  {
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: [
        'CREATED',
        'VERIFIED',
        'ASSIGNED',
        'STATUS_CHANGED',
        'RESOLVED',
        'CLOSED',
      ],
      required: true,
      index: true,
    },

    fromStatus: {
      type: String,
      enum: STATUS_ENUM,
    },

    toStatus: {
      type: String,
      enum: STATUS_ENUM,
    },

    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
complaintActivitySchema.index({ action: 1, createdAt: -1 });

export default mongoose.model(
  'ComplaintActivity',
  complaintActivitySchema
);
