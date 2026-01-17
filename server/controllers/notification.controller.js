import Notification from "../models/notification.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/mail.js";

// Send a notification (and email if provided)
export const sendNotification = async ({
  userId,
  title,
  message,
  type,
  event,
  email,
  name,
  complaintId = null,
}) => {
  if (!type || !event) {
    throw new Error("Notification type and event are required");
  }

  await Notification.create({
    userId,
    title,
    message,
    type,
    event,
    relatedComplaint: complaintId, // ✅ must match schema
  });

  if (email) {
    await sendEmail({
      email,
      subject: title,
      mailgenContent: {
        body: {
          name: name || "CityHelp User",
          intro: message,
        },
      },
    });
  }
};

// Get notifications for logged-in user
export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user._id,
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse({
      message: "Notifications fetched successfully",
      data: { notifications },
    })
  );
});

// Mark a notification as read
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return res.status(200).json(
    new ApiResponse({
      message: "Notification marked as read",
      data: { notification },
    })
  );
});

// Mark all notifications as read
export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true }
  );

  return res.status(200).json(
    new ApiResponse({
      message: "All notifications marked as read",
      data: {
        updatedCount: result.modifiedCount,
      },
    })
  );
});

// Get count of unread notifications
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false,
  });

  return res.status(200).json(
    new ApiResponse({
      message: "Unread count fetched successfully",
      data: { count },
    })
  );
});

// Delete a notification
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return res.status(200).json(
    new ApiResponse({
      message: "Notification deleted successfully",
    })
  );
});

