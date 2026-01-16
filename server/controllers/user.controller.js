import  User  from "../models/user.model.js";
import Complaint from "../models/complaint.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";


export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse({ data: { user: req.user }, message: "Current user fetched successfully" })
  );
});

export const updateCurrentUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  // ❌ nothing provided
  if (!name && !email) {
    throw new ApiError(400, "Please provide name or email");
  }

  const updateFields = {};

  // ✅ name (optional)
  if (name !== undefined) {
    if (!name.trim() || name.trim().length < 2) {
      throw new ApiError(400, "Name must be at least 2 characters long");
    }
    updateFields.name = name.trim();
  }

  // ✅ email (optional)
  if (email !== undefined) {
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      throw new ApiError(409, "Email already in use");
    }

    updateFields.email = email.toLowerCase();
    // optional (if you have verification)
    // updateFields.isVerified = false;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse({
      data: { user: updatedUser },
      message: "Profile updated successfully"
    })
  );
});

export const getMyAllComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({
    citizen: req.user._id,
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse({
      data: { complaints },
      message: "All my complaints fetched successfully",
    })
  );
});

export const getMyComplaintById = asyncHandler(async (req, res) => {
  const { id } = req.params;  

  const complaint = await Complaint.findOne({
    _id: id,
    citizen: req.user._id,
  });

   if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  return res.status(200).json(
    new ApiResponse({
      data: { complaint },
      message: "complaint fetched successfully",
    })
  );
});