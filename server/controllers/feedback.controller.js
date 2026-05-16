import { redis } from "../config/redis.js";
import { Feedback } from "../models/feedback.model.js";
import  Complaint from "../models/complaint.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { addRewardPoints } from "./reward.controller.js";
import Reward from "../models/reward.model.js";

// Create feedback for a complaint
export const createFeedback = asyncHandler(async (req, res) => {
  const complaintId = req.params.id;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new ApiError(404, "Complaint not found");

  const isOwner = complaint.citizen.equals(userId);
  const isSupporter = complaint.supporters.some(id => id.equals(userId));

  if (!isOwner && !isSupporter) {
    throw new ApiError(403, "Only owner or supporters can give feedback");
  }

  if (!["RESOLVED", "CLOSED"].includes(complaint.status)) {
    throw new ApiError(400, "Complaint not resolved yet");
  }

  const existing = await Feedback.findOne({
    complaint: complaintId,
    user: userId,
  });
  if (existing) {
    throw new ApiError(409, "Feedback already submitted");
  }

  const feedback = await Feedback.create({
    complaint: complaintId,
    user: userId,
    rating,
    comment,
  });

  if (!Array.isArray(complaint.feedback)) {
    complaint.feedback = [];
  }
  complaint.feedback.push(feedback._id);
  await complaint.save();

  await addRewardPoints({
      userId,
      points: 3,
      reason: "FEEDBACK_GIVEN",
      complaintId: complaint._id,
    });

  await redis.del("dashboard:*");

  return res.status(201).json(
    new ApiResponse({ message: "Feedback submitted", data: { feedback } })
  );
});

// Get all feedbacks for a complaint
export const getComplaintFeedbacks = asyncHandler(async (req, res) => {
  const { complaintId } = req.params;
  const user = req.user;

  // Verify the complaint exists
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // ============= Access Control =============
  // For CITIZEN role
  if (user.role === "CITIZEN") {
    const isOwner = complaint.citizen.equals(user._id);
    const isSupporter = complaint.supporters.some(
      (supporter) => supporter._id.equals(user._id)
    );

    if (!isOwner && !isSupporter) {
      throw new ApiError(403, "Access denied");
    }
  }

  // For OFFICER role
  if (
    user.role === "OFFICER" &&
    !complaint.assignedTo?.equals(user._id)
  ) {
    throw new ApiError(403, "Access denied");
  }

  const feedbacks = await Feedback.find({ complaint: complaintId })
    .populate("user", "name email avatar")
    .sort({ createdAt: -1 });

    await redis.del("feed:*");

  return res.status(200).json(
    new ApiResponse({
      data: { feedbacks },
      message: "Feedbacks retrieved successfully",
    })
  );
});


