import Complaint from '../models/complaint.model.js';
import ComplaintActivity from '../models/complaintActivity.model.js';
import User from '../models/user.model.js';

/* =========================
   STATUS FLOW (STATE MACHINE)
========================= */
const STATUS_FLOW = {
  SUBMITTED: ['VERIFIED'],
  VERIFIED: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED'],
};

const canTransition = (from, to) =>
  STATUS_FLOW[from]?.includes(to);

/* =========================
   CREATE COMPLAINT (CITIZEN)
========================= */
export const createComplaint = async (payload, user) => {
  const { category, description, attachments = [], location } = payload;

  const complaint = await Complaint.create({
    citizen: user._id,
    category,
    description,
    attachments,
    location,
    timeline: [{ status: 'SUBMITTED', updatedBy: user._id }],
  });

  await ComplaintActivity.create({
    complaintId: complaint._id,
    action: 'CREATED',
    toStatus: 'SUBMITTED',
    performedBy: user._id,
  });

  return complaint;
};

/* =========================
   VERIFY COMPLAINT (ADMIN)
========================= */
export const verifyComplaint = async (complaintId, admin) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new Error('Complaint not found');

  if (!canTransition(complaint.status, 'VERIFIED')) {
    throw new Error('Invalid status transition');
  }

  complaint.status = 'VERIFIED';
  complaint.verifiedBy = admin._id;

  complaint.timeline.push({
    status: 'VERIFIED',
    updatedBy: admin._id,
  });

  await complaint.save();

  await ComplaintActivity.create({
    complaintId,
    action: 'VERIFIED',
    toStatus: 'VERIFIED',
    performedBy: admin._id,
  });

  return complaint;
};

/* =========================
   ASSIGN COMPLAINT (ADMIN)
========================= */
export const assignComplaint = async (complaintId, officerId, admin) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new Error('Complaint not found');

  if (!canTransition(complaint.status, 'ASSIGNED')) {
    throw new Error('Complaint cannot be assigned now');
  }

  const officer = await User.findById(officerId);
  if (!officer || officer.role !== 'OFFICER') {
    throw new Error('Invalid officer');
  }

  complaint.status = 'ASSIGNED';
  complaint.assignedTo = officerId;

  complaint.timeline.push({
    status: 'ASSIGNED',
    updatedBy: admin._id,
  });

  await complaint.save();

  await ComplaintActivity.create({
    complaintId,
    action: 'ASSIGNED',
    toStatus: 'ASSIGNED',
    performedBy: admin._id,
  });

  return complaint;
};

/* =========================
   OFFICER WORKFLOW
========================= */
export const markInProgress = async (complaintId, officer) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new Error('Complaint not found');

  if (
    !canTransition(complaint.status, 'IN_PROGRESS') ||
    !complaint.assignedTo?.equals(officer._id)
  ) {
    throw new Error('Not authorized');
  }

  complaint.status = 'IN_PROGRESS';

  complaint.timeline.push({
    status: 'IN_PROGRESS',
    updatedBy: officer._id,
  });

  await complaint.save();

  return complaint;
};

export const resolveComplaint = async (complaintId, officer) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new Error('Complaint not found');

  if (
    !canTransition(complaint.status, 'RESOLVED') ||
    !complaint.assignedTo?.equals(officer._id)
  ) {
    throw new Error('Not authorized');
  }

  complaint.status = 'RESOLVED';
  complaint.resolvedAt = new Date();

  complaint.timeline.push({
    status: 'RESOLVED',
    updatedBy: officer._id,
  });

  await complaint.save();

  return complaint;
};

/* =========================
   CLOSE COMPLAINT (ADMIN)
========================= */
export const closeComplaint = async (complaintId, admin) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new Error('Complaint not found');

  if (!canTransition(complaint.status, 'CLOSED')) {
    throw new Error('Invalid status transition');
  }

  complaint.status = 'CLOSED';

  complaint.timeline.push({
    status: 'CLOSED',
    updatedBy: admin._id,
  });

  await complaint.save();

  return complaint;
};
