import mongoose, { Schema } from 'mongoose';

const complaintSchema = new Schema(
  {
    citizen: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    category: {
      type: String,
      enum: [
        'GARBAGE',
        'ROADS',
        'WATER',
        'STREETLIGHT',
        'ELECTRICITY',
        'OTHER',
      ],
      required: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    attachments: [
      {
        url: String,
        type: {
          type: String,
          enum: ['IMAGE', 'VIDEO', 'PDF'],
        },
      },
    ],

    location: {
      address: String,
      city: { type: String, index: true },
      district: { type: String, index: true },
      state: { type: String, index: true },
      pincode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
      autoDetected: { type: Boolean, default: false },
    },

    status: {
      type: String,
      enum: [
        'SUBMITTED',
        'VERIFIED',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLVED',
        'CLOSED',
      ],
      default: 'SUBMITTED',
      index: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    complaintId: {
      type: String,
      unique: true,
      index: true,
    },

    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    upvoteCount: {
      type: Number,
      default: 0,
    },

    aiCategory: String,
    aiConfidence: {
      type: Number,
      min: 0,
      max: 1,
    },

    timeline: [
      {
        status: String,
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

complaintSchema.pre('save', function (next) {
  if (!this.complaintId) {
    const city = (this.location?.city || 'GEN').slice(0, 3).toUpperCase();
    this.complaintId = `CMP-${city}-${Date.now()}-${Math.floor(
      100 + Math.random() * 900
    )}`;
  }
  next();
});

export default mongoose.model('Complaint', complaintSchema);
