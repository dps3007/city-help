import mongoose, { Schema } from 'mongoose';

// Enums
const STATUS_ENUM = [
  'SUBMITTED',
  'VERIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'REJECTED',
];

// Category options
const CATEGORY_ENUM = [
  'GARBAGE',
  'ROADS',
  'WATER',
  'STREETLIGHT',
  'ELECTRICITY',
  'OTHER',
];

// Attachment types
const ATTACHMENT_TYPE = ['IMAGE', 'VIDEO', 'PDF'];

// Complaint Schema
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

    attachments: [
      {
        url: { type: String },
        type: { type: String, enum: ATTACHMENT_TYPE },
      },
    ],

    location: {
      localAddress: {
        type: String,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        index: true,
      },

      district: {
        type: String,
        required: true,
        index: true,
      },

      state: {
        type: String,
        required: true,
        index: true,
      },

      pincode: {
        type: String,
      },

      coordinates: {
        lat: {
          type: Number,
        },

        lng: {
          type: Number,
        },
        
      },
      autoDetected: {
        type: Boolean,
        default: false,
      },
    },


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

    feedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback",
      default: null,
    },

    resolvedAt: {
      type: Date,
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

    priority: {
      type: String,
      enum: ["NORMAL", "MEDIUM", "HIGH"],
      default: "NORMAL",
    },

    municipalId: {
      type: String,
      index: true,
    },

    aiCategory: String,
    aiConfidence: {
      type: Number,
      min: 0,
      max: 1,
    },

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

// Pre-save hook to generate complaintId and maintain upvoteCount
complaintSchema.pre("save", function (next) {
  /* Generate readable complaint ID */
  if (!this.complaintId) {
    const city = (this.location?.city || "GEN")
      .slice(0, 3)
      .toUpperCase();

    this.complaintId = `CMP-${city}-${Date.now()}-${Math.floor(
      100 + Math.random() * 900
    )}`;
  }

  /* 🔥 ALWAYS SYNC UPVOTES */
  this.upvoteCount = this.upvotes.length;

  /* 🔥 AUTO PRIORITY */
  if (this.upvoteCount >= 5) this.priority = "HIGH";
  else if (this.upvoteCount >= 3) this.priority = "MEDIUM";
  else this.priority = "NORMAL";

  next();
});

export default mongoose.model('Complaint', complaintSchema);
