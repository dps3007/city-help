import mongoose, { Schema } from 'mongoose';

const STATUS_ENUM = [
  'SUBMITTED',
  'VERIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
];

const CATEGORY_ENUM = [
  'GARBAGE',
  'ROADS',
  'WATER',
  'STREETLIGHT',
  'ELECTRICITY',
  'OTHER',
];

const ATTACHMENT_TYPE = ['IMAGE', 'VIDEO', 'PDF'];

const complaintSchema = new Schema(
  {
    /* =======================
       OWNERSHIP
    ======================= */
    citizen: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    /* =======================
       CORE DETAILS
    ======================= */
    category: {
      type: String,
      enum: CATEGORY_ENUM,
      required: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    /* =======================
       ATTACHMENTS
    ======================= */
    attachments: [
      {
        url: { type: String },
        type: { type: String, enum: ATTACHMENT_TYPE },
      },
    ],

    /* =======================
       LOCATION
    ======================= */
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
      autoDetected: {
        type: Boolean,
        default: false,
      },
    },

    /* =======================
       STATUS & ASSIGNMENT
    ======================= */
    status: {
      type: String,
      enum: STATUS_ENUM,
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

    resolvedAt: {
      type: Date,
      default: null,
    },

    /* =======================
       IDENTIFIER
    ======================= */
    complaintId: {
      type: String,
      unique: true,
      index: true,
    },

    /* =======================
       COMMUNITY ENGAGEMENT
    ======================= */
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

    /* =======================
       AI METADATA (OPTIONAL)
    ======================= */
    aiCategory: String,
    aiConfidence: {
      type: Number,
      min: 0,
      max: 1,
    },

    /* =======================
       AUDIT TIMELINE
    ======================= */
    timeline: [
      {
        status: { type: String },
        updatedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

/* =======================
   INDEXES FOR ANALYTICS
======================= */
complaintSchema.index({ status: 1, district: 1 });
complaintSchema.index({ category: 1, status: 1 });

/* =======================
   PRE-SAVE HOOK
======================= */
complaintSchema.pre('save', function (next) {
  // Generate human-readable complaint ID
  if (!this.complaintId) {
    const city = (this.location?.city || 'GEN')
      .slice(0, 3)
      .toUpperCase();

    this.complaintId = `CMP-${city}-${Date.now()}-${Math.floor(
      100 + Math.random() * 900
    )}`;
  }

  // Keep upvoteCount consistent
  if (this.isModified('upvotes')) {
    this.upvoteCount = this.upvotes.length;
  }

  next();
});

export default mongoose.model('Complaint', complaintSchema);
