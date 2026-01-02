import mongoose, { Schema } from 'mongoose';

const STATUS_ENUM = [
  'SUBMITTED',
  'VERIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
];

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

/* Useful for admin dashboards */
complaintActivitySchema.index({ action: 1, createdAt: -1 });

export default mongoose.model(
  'ComplaintActivity',
  complaintActivitySchema
);
