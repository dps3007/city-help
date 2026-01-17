import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import Complaint from '../models/complaint.model.js';
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { sendEmail } from "../utils/mail.js";
import { ROLE_LEVEL } from '../middlewares/role.middleware.js';
import e from 'express';

// DASHBOARD STATS 
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalComplaints,
    submittedComplaints,
    resolvedComplaints,
    closedComplaints,
  ] = await Promise.all([
    User.countDocuments(),
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: "SUBMITTED" }),
    Complaint.countDocuments({ status: "RESOLVED" }),
    Complaint.countDocuments({ status: "CLOSED" }),
  ]);

  // ✅ CHANGED: correct pending logic
  const pendingComplaints =
    totalComplaints - resolvedComplaints - closedComplaints;

  return res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalComplaints,
      complaintSubmitted: submittedComplaints,
      resolvedComplaints,
      closedComplaints,
      pendingComplaints,
    },
  });
});

// update user role with proper checks
export const manageUser = asyncHandler(async (req, res) => {
  const { userId, role: newRole } = req.body;

  // Basic validation
  if (!userId || !newRole) {
    throw new ApiError(400, "userId and role are required");
  }

  //  Role validation
  if (!ROLE_LEVEL[newRole]) {
    throw new ApiError(400, "Invalid role");
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  // Self role change not allowed
  if (targetUser._id.equals(req.user._id)) {
    throw new ApiError(400, "You cannot change your own role");
  }

  const currentUserLevel = ROLE_LEVEL[req.user.role];
  const targetUserCurrentLevel = ROLE_LEVEL[targetUser.role];
  const newRoleLevel = ROLE_LEVEL[newRole];

  // ❌ Cannot modify equal or higher role user
  if (targetUserCurrentLevel >= currentUserLevel) {
    throw new ApiError(
      403,
      "You cannot modify a user with equal or higher role"
    );
  }

  // ❌ Cannot assign equal or higher role than yourself
  if (newRoleLevel >= currentUserLevel) {
    throw new ApiError(
      403,
      "You cannot assign a role equal to or higher than your own"
    );
  }

  // ✅ SAFE UPDATE
  const oldRole = targetUser.role;
  targetUser.role = newRole;
  await targetUser.save();

  return res.status(200).json(
    new ApiResponse({
      data: {
      userId: targetUser._id,
      oldRole,
      newRole,
    },
      message: "User role updated successfully"
    })
  );

});

// Get complaints with filters and pagination
export const getAdminComplaints = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    category,
    district,
    state,
  } = req.query;

  const filter = {};

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (district) filter['location.district'] = district;
  if (state) filter['location.state'] = state;

  const skip = (Number(page) - 1) * Number(limit);

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('citizen', 'name email')
      .populate('assignedTo', 'name email role'),

    Complaint.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    },
    data: complaints,
  });
});

// Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");

  return res.status(200).json(
    new ApiResponse({data: { users }, message: "All users fetched successfully"})
  );
});

// Create a new user (admin)
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, role, department } = req.body;

  if (!name || !email || !role) {
    throw new ApiError(400, "Required fields missing");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const tempPassword = "Welcome@123";
  const assignedBy = req.user._id;
  console.log("Assigned By:", assignedBy);

  const user = await User.create({
    name,
    email,
    role,
    assignedBy: assignedBy,
    department,
    password: tempPassword,
    isActive: true
  });

  // 📧 Send notification email
  await sendEmail({
    email: user.email,
    subject: "You have been added to CityHelp",
    mailgenContent: {
      body: {
        name: user.name,
        intro: `You have been added as a ${role} in CityHelp.`,
        table: {
          data: [
            { key: "Assigned By", value: req.user.name },
            { key: "Department", value: department || "N/A" },
            { key: "Role", value: role },
          ],
        },
        action: {
          instructions: "Use the following credentials to log in:",
          button: {
            text: "Login to CityHelp",
            link: process.env.FRONTEND_URL + "/login"
          }
        },
        outro: `Temporary Password: ${tempPassword}`
      }
    }
  });

  return res.status(201).json(
    new ApiResponse({ message: "User created and notified successfully" })
  );
});

