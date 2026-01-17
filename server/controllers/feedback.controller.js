import { Feedback } from "../models/feedback.model.js";
import  Complaint from "../models/complaint.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { addRewardPoints } from "./reward.controller.js";
import Reward from "../models/reward.model.js";

// Create feedback for a complaint
export const createFeedback = asyncHandler(async (req, res) => {
  const { complaintId, rating, comment } = req.body;

  if (!complaintId || !rating) {
    throw new ApiError(400, "Complaint ID and rating are required");
  }

  // ✅ DEFENSIVE: only citizen
  if (req.user.role !== "CITIZEN") {
    throw new ApiError(403, "Only citizens can submit feedback");
  }

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  if (complaint.citizen.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to give feedback for this complaint");
  }

  if (complaint.status !== "CLOSED") {
    throw new ApiError(
      400,
      "Feedback allowed only after complaint is closed"
    );
  }

  const existing = await Feedback.findOne({ complaint: complaintId });
  if (existing) {
    throw new ApiError(409, "Feedback already submitted");
  }

  const feedback = await Feedback.create({
    complaint: complaintId,
    user: req.user._id,
    rating,
    comment,
  });

  const rewardExists = await Reward.findOne({
    userId: req.user._id,
    complaintId,
    reason: "FEEDBACK_GIVEN",
  });

  if (!rewardExists) {
    await addRewardPoints({
      userId: req.user._id,
      points: 5,
      reason: "FEEDBACK_GIVEN",
      complaintId,
    });
  }

  return res.status(201).json(
    new ApiResponse({
      data: { feedback },
      message: "Feedback submitted successfully",
    })
  );
});

// Get feedback by complaint ID
export const getFeedbackByComplaint = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findOne({
    complaint: req.params.complaintId
  }).populate("user", "username");

  if (!feedback) {
    throw new ApiError(404, "Feedback not found");
  }

  return res.status(200).json(
    new ApiResponse({ data: { feedback } , message: "Feedback fetched successfully" })
  );
});

// Get all feedbacks (admin only)
export const getAllFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find()
    .populate("user", "username")
    .populate("complaint", "category status");

  return res.status(200).json(
    new ApiResponse({ data: { feedbacks } , message:  "All feedback fetched successfully"})
  );
});

