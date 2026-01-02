import asyncHandler from '../utils/asyncHandler.js';
import Complaint from '../models/complaint.model.js';
import * as ComplaintService from '../services/complaint.service.js';

/* =========================
   CREATE COMPLAINT (CITIZEN)
========================= */
export const createComplaint = asyncHandler(async (req, res) => {
  const complaint = await ComplaintService.createComplaint(
    req.body,
    req.user
  );

  res.status(201).json({
    success: true,
    data: complaint,
  });
});

/* =========================
   GET COMPLAINTS (ROLE-BASED)
========================= */
export const getComplaints = asyncHandler(async (req, res) => {
  const user = req.user;
  let filter = {};

  if (user.role === 'CITIZEN') {
    filter.citizen = user._id;
  }

  if (user.role === 'OFFICER') {
    filter.assignedTo = user._id;
  }

  // Admins can see all (or later filter by district/state)
  const complaints = await Complaint.find(filter)
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    success: true,
    data: complaints,
  });
});

/* =========================
   GET COMPLAINT BY ID
========================= */
export const getComplaintById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  // Ownership / access check
  if (
    user.role === 'CITIZEN' &&
    !complaint.citizen.equals(user._id)
  ) {
    res.status(403);
    throw new Error('Access denied');
  }

  if (
    user.role === 'OFFICER' &&
    !complaint.assignedTo?.equals(user._id)
  ) {
    res.status(403);
    throw new Error('Access denied');
  }

  res.status(200).json({
    success: true,
    data: complaint,
  });
});
