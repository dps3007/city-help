import asyncHandler from '../utils/asyncHandler.js';
import * as ComplaintService from '../services/complaint.service.js';

export const createComplaint = asyncHandler(async (req, res) => {
  const complaint = await ComplaintService.createComplaint(req.body, req.user);

  res.status(201).json({
    success: true,
    data: complaint,
  });
});

export const getComplaints = async (req, res) => {
  res.status(200).json({
    success: true,
    complaints: [],
  });
};

export const getComplaintById = async (req, res) => {
  const { id } = req.params;

  res.status(200).json({
    success: true,
    complaint: {
      id,
      status: 'pending',
    },
  });
};
