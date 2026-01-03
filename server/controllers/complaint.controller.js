import asyncHandler from "../utils/asyncHandler.js";
import Complaint from "../models/complaint.model.js";
import * as ComplaintService from "../services/complaint.service.js";
import { addRewardPoints } from "./reward.controller.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { sendNotification } from "./notification.controller.js";

/* =========================
CREATE COMPLAINT (CITIZEN)
========================= */
export const createComplaint = asyncHandler(async (req, res) => {
  const complaint = await ComplaintService.createComplaint(
    req.body,
    req.user
  );
  
  await sendNotification({
    userId: officer._id,
    title: "New Complaint Created",
    message: "A new complaint has been created by you. we Rectify it as soon as possible.",
    type: "COMPLAINT_CREATED",
    email: citizen.email,
    complaintId: complaint._id,
  });
  
  return res.status(201).json(
    new ApiResponse(201, complaint, "Complaint created successfully")
  );
});

export const assignComplaint = asyncHandler(async (req, res) => {
  const { officerId } = req.body;
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // Only Admin can assign (recommended)
  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Only admin can assign complaints");
  }

  // Assign officer
  complaint.assignedTo = officerId;
  complaint.status = "Assigned";
  await complaint.save();

  // Fetch officer details
  const officer = await User.findById(officerId);
  if (!officer) {
    throw new ApiError(404, "Officer not found");
  }

  // 🔔 NOTIFICATION GOES HERE
  await sendNotification({
    userId: officer._id,
    title: "New Complaint Assigned",
    message: "A new complaint has been assigned to you. Please take action.",
    type: "COMPLAINT_ASSIGNED",
    email: officer.email,
    complaintId: complaint._id,
  });

  return res.status(200).json(
    new ApiResponse(200, complaint, "Complaint assigned successfully")
  );
});

/* =========================
   GET COMPLAINTS (ROLE-BASED)
========================= */
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
    new ApiResponse(200, complaints, "Complaints fetched successfully")
  );
});

/* =========================
   GET COMPLAINT BY ID
========================= */
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

  return res.status(200).json(
    new ApiResponse(200, complaint, "Complaint fetched successfully")
  );
});

/* =========================
   VERIFY COMPLAINT (OFFICER / ADMIN)
========================= */
export const verifyComplaint = asyncHandler(async (req, res) => {
  const user = req.user;

  // 🔐 Role check
  if (!["OFFICER", "ADMIN"].includes(user.role)) {
    throw new ApiError(403, "Only officers or admins can verify complaints");
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // ❌ Prevent re-verification
  if (complaint.status === "Verified") {
    throw new ApiError(400, "Complaint already verified");
  }

  // ❌ Only pending complaints can be verified
  if (complaint.status !== "Pending") {
    throw new ApiError(
      400,
      `Cannot verify complaint in '${complaint.status}' state`
    );
  }

  complaint.status = "Verified";
  complaint.verifiedBy = user._id;
  complaint.verifiedAt = new Date();

  await complaint.save();

  // ✅ REWARD: complaint verified
  await addRewardPoints({
    userId: complaint.citizen, // correct owner
    points: 5,
    reason: "COMPLAINT_VERIFIED",
    complaintId: complaint._id,
  });

  await sendNotification({
  userId: complaint.citizen,
  title: "Complaint Verified",
  message: "Your complaint has been verified by the authority.",
  type: "COMPLAINT_VERIFIED",
  email: citizen.email,
  complaintId: complaint._id,
});


  return res.status(200).json(
    new ApiResponse(200, null, "Complaint verified successfully")
  );
});

export const resolveComplaint = asyncHandler(async (req, res) => {
  const user = req.user;

  // 🔐 Role check
  if (!["OFFICER", "ADMIN"].includes(user.role)) {
    throw new ApiError(403, "Only officers or admins can resolve complaints");
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // ❌ Prevent invalid transitions
  if (complaint.status === "Resolved") {
    throw new ApiError(400, "Complaint already resolved");
  }

  if (complaint.status !== "Verified") {
    throw new ApiError(
      400,
      "Only verified complaints can be resolved"
    );
  }

  // ✅ Resolve complaint
  complaint.status = "Resolved";
  complaint.resolvedBy = user._id;
  complaint.resolvedAt = new Date();

  await complaint.save();

  // 🏆 REWARD: complaint resolved
  await addRewardPoints({
    userId: complaint.citizen,
    points: 10,
    reason: "COMPLAINT_RESOLVED",
    complaintId: complaint._id,
  });

  await sendNotification({
  userId: complaint.citizen,
  title: "Complaint Resolved",
  message: "Your complaint has been successfully resolved.",
  type: "COMPLAINT_RESOLVED",
  email: citizen.email,
  complaintId: complaint._id,
});


  return res.status(200).json(
    new ApiResponse(200, null, "Complaint resolved successfully")
  );
});
