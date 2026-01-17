import asyncHandler from "../utils/asyncHandler.js";
import Complaint from "../models/complaint.model.js";
import * as ComplaintService from "../services/complaint.service.js";
import { addRewardPoints } from "./reward.controller.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { sendNotification } from "./notification.controller.js";
import User from "../models/user.model.js";

// Create a new complaint
export const createComplaint = asyncHandler(async (req, res) => {
  const complaint = await ComplaintService.createComplaint(
    req.body,
    req.user
  );
  
  return res.status(201).json(
    new ApiResponse({ message: "Complaint created successfully",
      data : {complaint}
    })
  );
});

// Get complaints for current user (citizen or officer)
export const getComplaints = asyncHandler(async (req, res) => {
  const user = req.user;
  let filter = {};

  if (user.role === "CITIZEN") {
    filter.citizen = user._id;
  }

  if (user.role === "OFFICER") {
    filter.assignedTo = user._id;
  }

  const complaints = await Complaint.find(filter)
    .sort({ createdAt: -1 })
    .limit(50);

  return res.status(200).json(
    new ApiResponse({
      message: "Complaints fetched successfully",
      data: complaints,
    })
  );
});

// Get complaint by ID with access control
export const getComplaintById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // Access control
  if (
    user.role === "CITIZEN" &&
    !complaint.citizen.equals(user._id)
  ) {
    throw new ApiError(403, "Access denied");
  }

  if (
    user.role === "OFFICER" &&
    !complaint.assignedTo?.equals(user._id)
  ) {
    throw new ApiError(403, "Access denied");
  }

  return res.status(201).json(
    new ApiResponse({ message: "Complaint fetched successfully",
      data : {complaint}
    })
  );
});

// Verify a complaint
export const verifyComplaint = asyncHandler(async (req, res) => {
  const user = req.user;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // ✅ CHANGED: correct enum
  if (complaint.status === "VERIFIED") {
    throw new ApiError(400, "Complaint already verified");
  }

  // ✅ CHANGED: only SUBMITTED can be verified
  if (complaint.status !== "SUBMITTED") {
    throw new ApiError(
      400,
      `Cannot verify complaint in '${complaint.status}' state`
    );
  }

  complaint.status = "VERIFIED";         // ✅ CHANGED
  complaint.verifiedBy = user._id;
  complaint.verifiedAt = new Date();
  await complaint.save();

  // ✅ CHANGED: fetch citizen properly
  const citizen = await User.findById(complaint.citizen);
  if (!citizen) {
    throw new ApiError(404, "Citizen not found");
  }

  await addRewardPoints({
    userId: citizen._id,
    points: 5,
    reason: "COMPLAINT_VERIFIED",
    complaintId: complaint._id,
  });

  await sendNotification({
    userId: citizen._id,
    name: citizen.name,
    title: "Complaint Verified",
    message: `Your complaint has been verified by ${user.name}.`,
    type: "STATUS",                    
    event: "COMPLAINT_VERIFIED",        
    email: citizen.email,
    complaintId: complaint._id,
  });

  return res.status(200).json(
    new ApiResponse({ message: "Complaint verified successfully" })
  );
});

// Assign a complaint to an officer
export const assignComplaint = asyncHandler(async (req, res) => {
  const { officerId } = req.body;
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // ✅ CHANGED: prevent reassignment
  if (complaint.status === "ASSIGNED") {
    throw new ApiError(400, "Complaint already assigned");
  }

  const citizen = await User.findById(complaint.citizen);
  if (!citizen) {
    throw new ApiError(404, "Citizen not found");
  }

  const officer = await User.findById(officerId);
  if (!officer) {
    throw new ApiError(404, "Officer not found");
  }

  // ✅ CHANGED: status enum
  complaint.assignedTo = officerId;
  complaint.status = "ASSIGNED";
  await complaint.save();

  // 🔔 Officer notification
  await sendNotification({
    userId: officer._id,
    name: officer.name,
    title: "New Complaint Assigned",
    message: "A new complaint has been assigned to you. Please take action.",
    type: "ASSIGNMENT", 
    event: "COMPLAINT_ASSIGNED",   
    email: officer.email,
    complaintId: complaint._id,
  });

  // 🔔 Citizen notification
  await sendNotification({
    userId: citizen._id,
    name: citizen.name,
    title: "Complaint Assigned",
    message: `Your complaint has been assigned to ${officer.name}.`,
    type: "ASSIGNMENT",        
    event: "COMPLAINT_ASSIGNED",     
    email: citizen.email,
    complaintId: complaint._id,
  });

  return res.status(201).json(
    new ApiResponse({
      message: "Complaint assigned successfully",
      data: { complaint },
    })
  );
});

// Start work on a complaint
export const startWork = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role !== "OFFICER") {
    throw new ApiError(403, "Only officers can start work on complaints");
  }

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  if (complaint.status !== "ASSIGNED") {
    throw new ApiError(400, "Only assigned complaints can be started");
  }

  complaint.status = "IN_PROGRESS";
  complaint.workStartedBy = user._id;
  complaint.workStartedAt = new Date();
  await complaint.save();

  const citizen = await User.findById(complaint.citizen);
  if (!citizen) {
    throw new ApiError(404, "Citizen not found");
  }

  await sendNotification({
    userId: citizen._id,
    name: citizen.name,
    title: "Work Started",
    message: `Work has started on your complaint.`,
    type: "STATUS",
    event: "COMPLAINT_WORK_STARTED",
    email: citizen.email,
    complaintId: complaint._id,
  });

  return res.status(200).json(
    new ApiResponse({ message: "Work started successfully", 
      data : {complaint}
    })
  );
});

// Resolve a complaint
export const resolveComplaint = asyncHandler(async (req, res) => {
  const user = req.user;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  
  if (complaint.status === "RESOLVED") {
    throw new ApiError(400, "Complaint already resolved");
  }

  if (complaint.status !== "IN_PROGRESS") {
    throw new ApiError(400, "Only in-progress complaints can be resolved");
  }

  complaint.status = "RESOLVED";        
  complaint.resolvedBy = user._id;
  complaint.resolvedAt = new Date();
  await complaint.save();

  const citizen = await User.findById(complaint.citizen); 
  if (!citizen) {
    throw new ApiError(404, "Citizen not found");
  }

  await addRewardPoints({
    userId: citizen._id,
    points: 10,
    reason: "COMPLAINT_RESOLVED",
    complaintId: complaint._id,
  });

  await sendNotification({
    userId: citizen._id,
    name: citizen.name,
    title: "Complaint Resolved",
    message: "Your complaint has been successfully resolved.",
    type: "STATUS",       
    event: "COMPLAINT_RESOLVED",   
    email: citizen.email,
    complaintId: complaint._id,
  });

  return res.status(200).json(
    new ApiResponse({ message: "Complaint resolved successfully",
      data : {complaint},
     })
  );
});

// Close a complaint
export const closeComplaint = asyncHandler(async (req, res) => {
  const user = req.user;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  if (complaint.status !== "RESOLVED") {
    throw new ApiError(
      400,
      `Only resolved complaints can be closed (current: ${complaint.status})`
    );
  }

  complaint.status = "CLOSED";
  complaint.closedBy = user._id;       
  complaint.closedAt = new Date();   
  await complaint.save();

  const citizen = await User.findById(complaint.citizen);
  if (!citizen) {
    throw new ApiError(404, "Citizen not found");
  }

  // 🔔 Notification to citizen
  await sendNotification({
    userId: citizen._id,
    name: citizen.name,
    title: "Complaint Closed",
    message: "Your complaint has been successfully closed.",
    type: "STATUS",
    event: "COMPLAINT_CLOSED",         
    email: citizen.email,
    complaintId: complaint._id,
  });

  return res.status(200).json(
    new ApiResponse({
      message: "Complaint closed successfully",
      data: { complaint },
    })
  );
});



