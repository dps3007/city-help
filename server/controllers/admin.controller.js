import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import Complaint from '../models/complaint.model.js';
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { sendEmail } from "../utils/mail.js";

/* ================= DASHBOARD STATS ================= */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalComplaints, resolvedComplaints] =
    await Promise.all([
      User.countDocuments(),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'RESOLVED' }),
    ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalComplaints,
      resolvedComplaints,
      pendingComplaints: totalComplaints - resolvedComplaints,
    },
  });
});

/* ================= USER MANAGEMENT ================= */
export const manageUser = asyncHandler(async (req, res) => {
  const { userId, action } = req.body;

  if (!userId || !action) {
    res.status(400);
    throw new Error('userId and action are required');
  }

  const allowedActions = ['BLOCK', 'UNBLOCK', 'DELETE'];

  if (!allowedActions.includes(action)) {
    res.status(400);
    throw new Error('Invalid action');
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (action === 'BLOCK') {
    user.isActive = false;
    await user.save();
  }

  if (action === 'UNBLOCK') {
    user.isActive = true;
    await user.save();
  }

  if (action === 'DELETE') {
    await user.deleteOne();
  }

  res.status(200).json({
    success: true,
    message: `User ${action} successfully`,
    userId,
  });
});


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

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");

  return res.status(200).json(
    new ApiResponse(200, { users }, "All users fetched successfully")
  );
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive must be boolean");
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { user },
      `User ${isActive ? "unblocked" : "blocked"} successfully`
    )
  );
});

export const createUser = asyncHandler(async (req, res) => {
  const { username, email, role, department } = req.body;

  if (!username || !email || !role) {
    throw new ApiError(400, "Required fields missing");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const tempPassword = "Welcome@123";

  const user = await User.create({
    username,
    email,
    role,
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
        name: user.username,
        intro: `You have been added as a ${role} in CityHelp.`,
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
    new ApiResponse(201, null, "User created and notified successfully")
  );
});
