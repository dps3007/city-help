import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    // 🔹 Who receives the notification
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🔹 Display content
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    // 🔹 Generic category (for UI, filters, icons)
    type: {
      type: String,
      enum: ["STATUS", "ASSIGNMENT", "REMINDER", "SYSTEM"],
      required: true,
    },

    // 🔹 Specific action (for logic, analytics, audits)
    event: {
      type: String,
      enum: [
        "COMPLAINT_VERIFIED",
        "COMPLAINT_ASSIGNED",
        "COMPLAINT_WORK_STARTED",
        "COMPLAINT_RESOLVED",
        "COMPLAINT_CLOSED",
        "USER_CREATED",
      ],
      required: true,
    },

    // 🔹 Optional reference
    relatedComplaint: {
      type: Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
    },

    // 🔹 Read status
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

export default mongoose.model("Notification", notificationSchema);
