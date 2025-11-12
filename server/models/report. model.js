import mongoose, { Schema } from 'mongoose';

const reportSchema = new Schema(
  {
    // 🧍 Citizen who reported the issue
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // 🗂️ Category of the complaint
    category: {
      type: String,
      enum: [
        'Garbage',
        'Roads',
        'Water',
        'Streetlight',
        'Electricity',
        'Other',
      ],
      required: [true, 'Please select a complaint category'],
    },

    // 📝 Description of the issue
    description: {
      type: String,
      required: [true, 'Please provide a short description of the issue'],
      trim: true,
    },

    // 📸 Image Proof (optional)
    image: {
      url: { type: String, default: '' },
      localPath: { type: String, default: '' },
    },

    // 📍 Location details
    location: {
      address: { type: String },
      city: { type: String },
      district: { type: String },
      state: { type: String },
      pincode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
      autoDetected: { type: Boolean, default: false },
    },

    // 📊 Complaint status tracking
    status: {
      type: String,
      enum: [
        'Submitted',
        'Verified',
        'Assigned',
        'In Progress',
        'Resolved',
        'Closed',
      ],
      default: 'Submitted',
    },

    // 🔗 Workflow assignments
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Could be department head / admin
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // 🆔 Complaint Reference ID
    complaintId: {
      type: String,
      unique: true,
      index: true,
    },

    // 👍 Upvote system
    upvotes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },

    // ⭐ Feedback (citizen after resolution)
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, trim: true },
    },

    // 📦 Attachments (optional)
    attachments: [
      {
        url: { type: String },
        type: { type: String }, // e.g., "image", "video", "pdf"
      },
    ],

    // 🧠 AI auto-category confidence (optional for future)
    aiCategory: { type: String },
    aiConfidence: { type: Number },

    // 🕐 Timeline tracking
    timestampsLog: [
      {
        status: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        time: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// 🆔 Auto-generate unique Complaint ID
reportSchema.pre('save', async function (next) {
  if (!this.complaintId) {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const cityCode = (this.location?.city || 'GEN').slice(0, 3).toUpperCase();
    this.complaintId = `CMP-${cityCode}-${year}-${randomNum}`;
  }
  next();
});

const Report = mongoose.model('Report', reportSchema);
export default Report;
