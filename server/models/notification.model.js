import mongoose, { Schema } from "mongoose";

// Notification Schema
const notificationSchema = new Schema(
  {
    // Who receives the notification
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Display content
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

    //  Category of notification
    type: {
      type: String,
      enum: ["STATUS", "ASSIGNMENT", "REMINDER", "SYSTEM"],
      required: true,
    },

    // Specific event triggering the notification
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

    // Optional related complaint
    relatedComplaint: {
      type: Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
    },

    // Read status
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
