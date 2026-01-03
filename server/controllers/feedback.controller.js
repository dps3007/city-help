import { Feedback } from "../models/feedback.model.js";
import  Complaint from "../models/complaint.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { addRewardPoints } from "./reward.controller.js";

export const createFeedback = asyncHandler(async (req, res) => {
  const { complaintId, rating, comment } = req.body;

  if (!complaintId || !rating) {
    throw new ApiError(400, "Complaint ID and rating are required");
  }

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // Only owner can give feedback
  if (complaint.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to give feedback for this complaint");
  }

  // Only after resolution
  if (complaint.status !== "Resolved") {
    throw new ApiError(400, "Feedback allowed only after complaint is resolved");
  }

  // Prevent duplicate feedback
  const existing = await Feedback.findOne({ complaint: complaintId });
  if (existing) {
    throw new ApiError(409, "Feedback already submitted");
  }

  const feedback = await Feedback.create({
    complaint: complaintId,
    user: req.user._id,
    rating,
    comment
  });

  await addRewardPoints({
    userId: req.user._id,
    points: 5,
    reason: "FEEDBACK_GIVEN",
    complaintId,
  });

  return res.status(201).json(
    new ApiResponse(201, { feedback }, "Feedback submitted successfully")
  );
});


export const getFeedbackByComplaint = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findOne({
    complaint: req.params.complaintId
  }).populate("user", "username");

  if (!feedback) {
    throw new ApiError(404, "Feedback not found");
  }

  return res.status(200).json(
    new ApiResponse(200, { feedback }, "Feedback fetched successfully")
  );
});


export const getAllFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find()
    .populate("user", "username")
    .populate("complaint", "category status");

  return res.status(200).json(
    new ApiResponse(200, { feedbacks }, "All feedback fetched successfully")
  );
});
