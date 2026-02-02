import  User  from "../models/user.model.js";
import Complaint from "../models/complaint.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import Municipal from "../models/municipal.model.js";


//updateAvtar
export const updateAvatar = asyncHandler(async (req, res) => {
  const file = req.file;
  

  if (!file) {
    throw new ApiError(400, "Profile image is required");
  }

  // 🔥 SAME AS COMPLAINT
  const result = await uploadToCloudinary(file.buffer);

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.avatar.url = result.secure_url;
  user.avatar.localPath = ""; // optional
  await user.save();

  return res.status(200).json(
    new ApiResponse({
      message: "Profile photo updated successfully",
      data: {
        user,
      },
    })
  );
});

// Get current logged-in user details
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse({
      data: { user },
      message: "Current user fetched successfully",
    })
  );
});

// Update current logged-in user profile
export const updateCurrentUser = asyncHandler(async (req, res) => {
  const { name, email, state, district, city, department, municipalId } = req.body;


  if (
    name === undefined &&
    email === undefined &&
    state === undefined &&
    district === undefined &&
    city === undefined &&
    department === undefined  &&
    municipalId === undefined
  ) {
    throw new ApiError(
      400,
      "Please provide at least one field to update"
    );
  }

  const updateFields = {};

  /* ---------- name ---------- */
  if (name !== undefined) {
    if (!name.trim() || name.trim().length < 2) {
      throw new ApiError(
        400,
        "Name must be at least 2 characters long"
      );
    }
    updateFields.name = name.trim();
  }

  /* ---------- email ---------- */
  if (email !== undefined) {
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      throw new ApiError(409, "Email already in use");
    }

    updateFields.email = email.toLowerCase();
  }

  /* ---------- location (nested) ---------- */
  if (state !== undefined) {
    updateFields["location.state"] =
      state?.trim().toLowerCase() || null;
  }

  if (district !== undefined) {
    updateFields["location.district"] =
      district?.trim().toLowerCase() || null;
  }

  if (city !== undefined) {
    updateFields["location.city"] =
      city?.trim().toLowerCase() || null;
  }

  /* ---------- department---------- */
  if (department !== undefined) {
    const allowedRoles = ["DEPT_HEAD", "OFFICER", "WORKER"];

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        "You are not allowed to update department"
      );
    }

    const allowedDepartments = [
      "GARBAGE",
      "ROADS",
      "WATER",
      "STREETLIGHT",
      "ELECTRICITY",
      "OTHER",
    ];

    if (!allowedDepartments.includes(department)) {
      throw new ApiError(400, "Invalid department");
    }

    updateFields.department = department;
  }

  /* ---------- municipalId ---------- */
  if (municipalId !== undefined) {
    const allowedRoles = [
      "DISTRICT_ADMIN",
      "DEPT_HEAD",
      "OFFICER",
      "WORKER",
    ];

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        "You are not allowed to update municipalId"
      );
    }

    updateFields.municipalId = municipalId;
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
      message: "Profile updated successfully",
    })
  );
});


// Get all complaints of the logged-in user
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

// Get a specific complaint of the logged-in user by ID
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