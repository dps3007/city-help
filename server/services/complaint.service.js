import Complaint from '../models/complaint.model.js';
import ComplaintActivity from '../models/complaintActivity.model.js';

export const createComplaint = async (payload, user) => {
  const complaint = await Complaint.create({
    ...payload,
    citizen: user._id,
    timeline: [
      {
        status: 'SUBMITTED',
        updatedBy: user._id,
      },
    ],
  });

  await ComplaintActivity.create({
    complaintId: complaint._id,
    action: 'CREATED',
    toStatus: 'SUBMITTED',
    performedBy: user._id,
  });

  return complaint;
};

export const updateStatus = async (complaintId, status, user) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new Error('Complaint not found');

  complaint.status = status;
  complaint.timeline.push({
    status,
    updatedBy: user._id,
  });

  await complaint.save();

  await ComplaintActivity.create({
    complaintId,
    action: 'STATUS_CHANGED',
    toStatus: status,
    performedBy: user._id,
  });

  return complaint;
};
