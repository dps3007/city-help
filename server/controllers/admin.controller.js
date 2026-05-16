import dotenv from "dotenv";
dotenv.config();

import { redis } from "../config/redis.js";
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import Complaint from '../models/complaint.model.js';
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { sendEmail } from "../utils/mail.js";
import { ROLE_LEVEL } from '../middlewares/role.middleware.js';

// DASHBOARD STATS 
export const getDashboardStats = asyncHandler(async (req, res) => {
  const { role, location, department, _id } = req.user;

  const cacheKey = `dashboard:${role}:${location?.state || "all"}:${location?.district || "all"}:${department || "all"}:${_id}`;

  // cache (guarded) - a Redis failure should not bring down the dashboard
  let cached = null;
  try {
    cached = await redis.get(cacheKey);
  } catch (redisErr) {
    console.error('Redis get error for dashboard cache:', redisErr?.message || redisErr);
  }

  if (cached) {
    return res.status(200).json(
      new ApiResponse({
        data: cached,
        cached: true,
      })
    );
  }

  let complaintFilter = {};
  let userFilter = {};

  switch (role) {
    case "SUPER_ADMIN":
    case "CENTRAL_ADMIN":
      break;

    case "STATE_ADMIN":
      complaintFilter["location.state"] = new RegExp(`^${location.state}$`, "i");
      userFilter["location.state"] = new RegExp(`^${location.state}$`, "i");
      break;

    case "DISTRICT_ADMIN":
      complaintFilter["location.state"] = new RegExp(`^${location.state}$`, "i");
      complaintFilter["location.district"] = new RegExp(`^${location.district}$`, "i");
      userFilter["location.district"] = new RegExp(`^${location.district}$`, "i");
      break;

    case "DEPT_HEAD":
      complaintFilter["location.district"] = new RegExp(`^${location.district}$`, "i");
      complaintFilter.category = new RegExp(`^${department}$`, "i");
      break;

    case "OFFICER":
      complaintFilter.category = new RegExp(`^${department}$`, "i");
      complaintFilter.assignedTo = _id;
      break;

    case "WORKER":
      complaintFilter.category = new RegExp(`^${department}$`, "i");
      complaintFilter.assignedWorker = _id;
      break;

    default:
      throw new ApiError(403, "Invalid role");
  }

  const [
    totalUsers,
    totalComplaints,
    submittedComplaints,
    resolvedComplaints,
    closedComplaints,
  ] = await Promise.all([
    User.countDocuments(userFilter),
    Complaint.countDocuments(complaintFilter),
    Complaint.countDocuments({ ...complaintFilter, status: "SUBMITTED" }),
    Complaint.countDocuments({ ...complaintFilter, status: "RESOLVED" }),
    Complaint.countDocuments({ ...complaintFilter, status: "CLOSED" }),
  ]);

  const data = {
    totalUsers,
    totalComplaints,
    complaintSubmitted: submittedComplaints,
    resolvedComplaints,
    closedComplaints,
    pendingComplaints:
      totalComplaints - resolvedComplaints - closedComplaints,
  };

  // Save to cache (TTL = 60 sec) - ignore Redis errors
  try {
    await redis.set(cacheKey, data, { ex: 60 });
  } catch (redisErr) {
    console.error('Redis set error for dashboard cache:', redisErr?.message || redisErr);
  }

  return res.status(200).json(new ApiResponse({ data }));
});

// update user role with proper checks
export const manageUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  let { role } = req.body;

  if (!role || typeof role !== "string") {
    throw new ApiError(400, "Role is required");
  }
  if (!ROLE_LEVEL.hasOwnProperty  (role)) {
    throw new ApiError(400, "Invalid role");
  }

  role = role.trim().toUpperCase(); 
  if (!(role in ROLE_LEVEL)) {
    throw new ApiError(400, "Invalid role");
  }
 
  const targetUser = await User.findById(userId);
  
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const currentUserLevel = ROLE_LEVEL[req.user.role];
  const targetUserLevel = ROLE_LEVEL[targetUser.role];
  const newRoleLevel = ROLE_LEVEL[role];


  if (targetUserLevel >= currentUserLevel) {
    throw new ApiError(403, "Cannot modify equal or higher role user");
  }

  if (newRoleLevel >= currentUserLevel) {
    throw new ApiError(403, "Cannot assign equal or higher role");
  }

  const updatedUser = await User.findByIdAndUpdate(
  userId,
  { role },
  { new: true, runValidators: true }
);

  //Redis invalidate 
  await redis.del("dashboard:*");

  return res.status(200).json(
    new ApiResponse({
      message: "User role updated successfully",
      data: {
        id: targetUser._id,
        role: targetUser.role,
      },
    })
  );
});

// Get complaints with filters and pagination
export const getAdminComplaints = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, category } = req.query;

  const filter = {};

  if (status) filter.status = status;
  if (category) filter.category = category;

  switch (req.user.role) {
    case "STATE_ADMIN":
      filter["location.state"] = {
        $regex: `^${req.user.location.state}$`,
        $options: "i",
      };
      break;

    case "DISTRICT_ADMIN":
      filter["location.district"] = {
        $regex: `^${req.user.location.district}$`,
        $options: "i",
      };
      break;

    case "DEPT_HEAD":
      filter.category = {
        $regex: `^${req.user.department}$`,
        $options: "i",
      };
      filter["location.district"] = {
        $regex: `^${req.user.location.district}$`,
        $options: "i",
      };
      break;

    case "OFFICER":
      filter.assignedTo = req.user._id;
      break;

    case "WORKER":
      filter.assignedWorker = req.user._id;
      break;
  }

  const skip = (page - 1) * limit;

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("citizen", "name email")
      .populate("assignedTo", "name email role"),

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
  let filter = {};

  if (req.user.role === "STATE_ADMIN") {
    filter.state = req.user.state;
  }

  if (req.user.role === "DISTRICT_ADMIN") {
    filter.district = req.user.district;
  }

  const users = await User.find(filter).select("-communityPoints");

  return res.status(200).json(
    new ApiResponse({
      data: { users },
      message: "Users fetched successfully",
    })
  );
});

// Create a new user (admin)
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, role, department } = req.body;
  
  if (role === "DEPT_HEAD" && !department) {
    throw new ApiError(400, "Department is required for Dept Head");
  } 

  if (!ROLE_LEVEL.hasOwnProperty(role)) {
  throw new ApiError(400, "Invalid role");
}

  if (!name || !email || !role) {
    throw new ApiError(400, "Required fields missing");
  }

  if (!ROLE_LEVEL[role]) {
    throw new ApiError(400, "Invalid role");
  }

  const creatorLevel = ROLE_LEVEL[req.user.role];
  const newUserLevel = ROLE_LEVEL[role];

  if (newUserLevel >= creatorLevel) {
    throw new ApiError(403, "Cannot create equal or higher role");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const tempPassword = process.env.TEMP_USER_PASSWORD;

  const user = await User.create({
    name,
    email,
    role,
    department,
    assignedBy: req.user._id,
    password: tempPassword,
    isActive: true,
  });

  await sendEmail({
    email: user.email,
    subject: `Welcome to CityHelp - ${role} Account Created`,
    mailgenContent: {
      body: {
        name: user.name,
        intro: `Your ${role} account has been successfully created in the CityHelp civic operations platform.`,
        table: {
          data: [
            { key: "Email", value: user.email },
            { key: "Role", value: role },
            { key: "Department", value: department || "N/A" },
            { key: "Account Status", value: "Active" },
          ],
        },
        action: {
          instructions: "Use your email and the temporary password below to sign in:",
          button: {
            color: "#0891b2",
            text: "Login to CityHelp",
            link: process.env.CLIENT_URL || "https://cityhelp.example.com",
          },
        },
        outro: [
          `<strong>Temporary Password:</strong> <code>${tempPassword}</code>`,
          "Please change your password after your first login for security purposes.",
          "If you did not expect this email or have questions, please contact the system administrator.",
        ].join("\n\n"),
      },
    },
  });

  // Redis invalidate
  await redis.del("dashboard:*");

  return res.status(201).json(
    new ApiResponse({ message: "User created successfully" })
  );
});


