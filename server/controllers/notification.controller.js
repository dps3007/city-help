import Notification from "../models/notification.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/mail.js";


export const sendNotification = async ({
  userId,
  title,
  message,
  type,
  email,
  complaintId = null,
}) => {
  // Save in DB
  await Notification.create({
    userId,
    title,
    message,
    type,
    relatedComplaint: complaintId,
  });

  // Send email
  if (email) {
    await sendEmail({
      email,
      subject: title,
      mailgenContent: {
        body: {
          name: "CityHelp User",
          intro: message,
        },
      },
    });
  }
};


export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user._id,
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      notifications,
      "Notifications fetched successfully"
    )
  );
});


export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      notification,
      "Notification marked as read"
    )
  );
});
