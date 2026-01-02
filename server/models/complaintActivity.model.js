import mongoose, { Schema } from 'mongoose';

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
    },

    fromStatus: String,
    toStatus: String,

    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    remarks: String,
  },
  { timestamps: true }
);

export default mongoose.model('ComplaintActivity', complaintActivitySchema);
