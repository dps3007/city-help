import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import Complaint from '../models/complaint.model.js';
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { sendEmail } from "../utils/mail.js";
import { ROLE_LEVEL } from '../middlewares/role.middleware.js';


// DASHBOARD STATS 
export const getDashboardStats = asyncHandler(async (req, res) => {
  res.set("Cache-Control", "no-store");

  const { role, location, department, _id } = req.user;

  let complaintFilter = {};
  let userFilter = {};

  switch (role) {
    case "SUPER_ADMIN":
    case "CENTRAL_ADMIN":
      // no filter
      break;

    case "STATE_ADMIN":
      complaintFilter["location.state"] = {
        $regex: `^${location.state}$`,
        $options: "i",
      };
      userFilter["location.state"] = {
        $regex: `^${location.state}$`,
        $options: "i",
      };
      break;

    case "DISTRICT_ADMIN":
      complaintFilter["location.state"] = {
        $regex: `^${location.state}$`,
        $options: "i",
      };
      complaintFilter["location.district"] = {
        $regex: `^${location.district}$`,
        $options: "i",
      };
      userFilter["location.district"] = {
        $regex: `^${location.district}$`,
        $options: "i",
      };
      break;

    case "DEPT_HEAD":
      complaintFilter.category = department;
      break;

    case "OFFICER":
      complaintFilter.assignedTo = _id;
      break;

    case "WORKER":
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

  const pendingComplaints =
    totalComplaints - resolvedComplaints - closedComplaints;

  return res.status(200).json(
    new ApiResponse({
      data: {
        totalUsers,
        totalComplaints,
        complaintSubmitted: submittedComplaints,
        resolvedComplaints,
        closedComplaints,
        pendingComplaints,
      },
    })
  );
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
      filter["location.state"] = req.user.state;
      break;

    case "DISTRICT_ADMIN":
      filter["location.district"] = req.user.district;
      break;

    case "DEPT_HEAD":
      filter.department = req.user.department;
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

  const users = await User.find(filter).select("-password");

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

  console.log("Create User Request Body:", req.body);
  console.log("department:", department);
  

  if (role === "DEPT_HEAD" && !department) {
    throw new ApiError(400, "Department is required for Dept Head");
  } 

  console.log("Validated role:", role);

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

  console.log("Creator Level:", creatorLevel);
  console.log("New User Level:", newUserLevel);

  if (newUserLevel >= creatorLevel) {
    throw new ApiError(403, "Cannot create equal or higher role");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const tempPassword = "Welcome@123";

  console.log("Creating user with email:", email);
  console.log("Assigned department:", department);
  const user = await User.create({
    name,
    email,
    role,
    department,
    assignedBy: req.user._id,
    password: tempPassword,
    isActive: true,
  });

  console.log("User created:", user._id);

  await sendEmail({
    email: user.email,
    subject: "You have been added to CityHelp",
    mailgenContent: {
      body: {
        name: user.name,
        intro: `You have been added as a ${role} in CityHelp.`,
        outro: `Temporary Password: ${tempPassword}`,
      },
    },
  });

  return res.status(201).json(
    new ApiResponse({ message: "User created successfully" })
  );
});


