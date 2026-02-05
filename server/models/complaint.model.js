import mongoose, { Schema } from "mongoose";

// Enums
const STATUS_ENUM = [
  "SUBMITTED",
  "VERIFIED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REJECTED",
];

const CATEGORY_ENUM = [
  "GARBAGE",
  "ROADS",
  "WATER",
  "STREETLIGHT",
  "ELECTRICITY",
  "OTHER",
];

const ATTACHMENT_TYPE = ["IMAGE", "VIDEO", "PDF"];

const complaintSchema = new Schema(
  {
    citizen: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

    /* ================= LOCATION (SINGLE SOURCE OF TRUTH) ================= */
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

      geo: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [lng, lat]
          required: true,
        },
      },

      autoDetected: {
        type: Boolean,
        default: false,
      },
    },

    /* ================= STATUS / FLOW ================= */
    status: {
      type: String,
      enum: STATUS_ENUM,
      default: "SUBMITTED",
      index: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    feedback: [
      {
        type: Schema.Types.ObjectId,
        ref: "Feedback",
      }
    ],

    /* ================= CROWD + PRIORITY ================= */
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    supporters: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
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

    /* ================= MUNICIPAL / AI ================= */
    municipalId: {
      type: Schema.Types.ObjectId,
      ref: "Municipal",
      index: true,
    },

    aiCategory: String,
    aiConfidence: {
      type: Number,
      min: 0,
      max: 1,
    },

    /* ================= TIMELINE ================= */
    timeline: [
      {
        status: { type: String },
        updatedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        at: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    complaintId: {
      type: String,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
complaintSchema.index({ "location.geo": "2dsphere" });
complaintSchema.index({ supporters: 1 });

/* ================= PRE-SAVE HOOK ================= */
complaintSchema.pre("save", function (next) {
  if (!this.complaintId) {
    const city = (this.location?.city || "GEN")
      .slice(0, 3)
      .toUpperCase();

    this.complaintId = `CMP-${city}-${Date.now()}-${Math.floor(
      100 + Math.random() * 900
    )}`;
  }

  this.upvoteCount = this.upvotes.length;

  if (this.upvoteCount >= 5) this.priority = "HIGH";
  else if (this.upvoteCount >= 3) this.priority = "MEDIUM";
  else this.priority = "NORMAL";

  next();
});

export default mongoose.model("Complaint", complaintSchema);
