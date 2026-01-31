import { io } from "../server.js";
import asyncHandler from "../utils/asyncHandler.js";
import Complaint from "../models/complaint.model.js";
import * as ComplaintService from "../services/complaint.service.js";
import { addRewardPoints } from "./reward.controller.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { sendNotification } from "./notification.controller.js";
import User from "../models/user.model.js";
import { Feedback } from "../models/feedback.model.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";


export const getAllComplaints = asyncHandler(async (req, res) => {

  const { department } = req.query;
  const { role, location } = req.user;


  const filter = {};

  // department-wise filter
  if (department) {
    filter.category = department;
  }

if (role === "STATE_ADMIN") {
  filter["location.state"] = {
    $regex: `^${req.user.location.state}$`,
    $options: "i", // case-insensitive
  };
}

  // 🔥 DISTRICT ADMIN
  if (role === "DISTRICT_ADMIN") {
    filter["location.state"] = {
      $regex: `^${location.state}$`,
      $options: "i",
    };
    filter["location.district"] = {
      $regex: `^${location.district}$`,
      $options: "i",
    };
  }

  // 🔥 CITY ADMIN (future-safe)
  if (role === "CITY_ADMIN") {
    filter["location.state"] = {
      $regex: `^${location.state}$`,
      $options: "i",
    };
    filter["location.district"] = {
      $regex: `^${location.district}$`,
      $options: "i",
    };
    filter["location.city"] = {
      $regex: `^${location.city}$`,
      $options: "i",
    };
  }

  if (role === "OFFICER") {
  filter.category = {
    $regex: `^${req.user.department}$`,
    $options: "i",
  };
  filter.assignedTo = req.user._id;
}


  const complaints = await Complaint.find(filter)
    .populate("citizen", "name email")
    .populate("verifiedBy", "name email role")
    .populate("assignedTo", "name email role")
    .sort({ createdAt: -1 });

  res.status(200).json(complaints);
});

// Create a new complaint
export const createComplaint = asyncHandler(async (req, res) => {
  const { category, description, location: locationStr } = req.body;
  const file = req.file;

  if (!req.file) {
    throw new ApiError(400, "Complaint image is required");
  }

  let location = null;
  if (locationStr) {
    try {
      location = typeof locationStr === "string" ? JSON.parse(locationStr) : locationStr;
    } catch (e) {
      location = { address: locationStr };
    }
  }

  // Build attachments array if image uploaded
  const attachments = [];

  if (file) {
    const result = await uploadToCloudinary(file.buffer);


    attachments.push({
      url: result.secure_url, 
      type: "IMAGE",
    });
  }

  const complaint = await ComplaintService.createComplaint(
    { category, description, attachments, location },
    req.user
  );

  // 🔴 REAL-TIME: new complaint
  if (complaint?.location?.district) {
    io.to(`district:${complaint.location.district}`).emit(
      "complaint:new",
      complaint
    );
  }

  if (complaint?.location?.state) {
    io.to(`state:${complaint.location.state}`).emit(
      "complaint:new",
      complaint
    );
  }

  // central feed
  io.to("india").emit("complaint:new", complaint);

  
  return res.status(201).json(
    new ApiResponse({ 
      message: "Complaint created successfully",
      data: { complaint }
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
    .populate("verifiedBy", "name email role")
    .populate("assignedTo", "name email role")
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
  const user = req.user._id;

  const complaint = await Complaint.findById(id)
  .populate("feedback")
  .populate("assignedTo", "name email role")
  .populate("verifiedBy", "name email role");
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
  const officer = req.user;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // Only SUBMITTED → VERIFIED
  if (complaint.status !== "SUBMITTED") {
    throw new ApiError(
      400,
      `Cannot verify complaint in '${complaint.status}' state`
    );
  }

  // Update complaint
  complaint.status = "VERIFIED";
  complaint.verifiedBy = officer._id;
  complaint.verifiedAt = new Date();
  await complaint.save();

  // 🔴 REAL-TIME: complaint verified
  io.to(`district:${complaint.location.district}`).emit(
    "complaint:verified",
    {
      complaintId: complaint._id,
      officer,
      status: complaint.status,
    }
  );


  // Fetch citizen
  const citizen = await User.findById(complaint.citizen);
  if (!citizen) {
    throw new ApiError(404, "Citizen not found");
  }

 await addRewardPoints({
  userId: citizen._id,
  points: 3,
  reason: "COMPLAINT_VERIFIED",
  complaintId: complaint._id,
});


  // 🔔 Notification
  await sendNotification({
    userId: citizen._id,
    name: citizen.name,
    title: "Complaint Verified",
    message: `Your complaint has been verified by ${officer.name}.`,
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

  // 🔴 REAL-TIME: complaint assigned
  io.to(`district:${complaint.location.district}`).emit(
    "complaint:assigned",
    {
      complaintId: complaint._id,
      officer,
      status: complaint.status,
    }
  );

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

  // 🔴 REAL-TIME: work started
  io.to(`district:${complaint.location.district}`).emit(
    "complaint:started",
    {
      complaintId: complaint._id,
      status: complaint.status,
    }
  );

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

  // 🔴 REAL-TIME: complaint resolved
  io.to(`district:${complaint.location.district}`).emit(
    "complaint:resolved",
    {
      complaintId: complaint._id,
      status: complaint.status,
    }
  );

  const citizen = await User.findById(complaint.citizen); 
  if (!citizen) {
    throw new ApiError(404, "Citizen not found");
  }

  await addRewardPoints({
  userId: citizen._id,
  points: 4,
  reason: "COMPLAINT_RESOLVED",
  complaintId: complaint._id,
});

  // 🔔 Notification to citizen
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

  // 🔴 REAL-TIME: complaint closed
  io.to(`district:${complaint.location.district}`).emit(
    "complaint:closed",
    {
      complaintId: complaint._id,
      status: complaint.status,
    }
  );

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

// Citizen → upvote complaint
export const upvoteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new ApiError(404, "Not found");

  const userId = req.user._id.toString();

  const index = complaint.upvotes.findIndex(
    (u) => u.toString() === userId
  );

  if (index !== -1) {
    complaint.upvotes.splice(index, 1);
  } else {
    complaint.upvotes.push(req.user._id);
  }

  await complaint.save();

  // 🔥 SINGLE SOURCE OF TRUTH
  io.to("feed:all").emit("complaint:upvote", {
    complaintId: complaint._id.toString(),
    upvoteCount: complaint.upvoteCount,
    priority: complaint.priority,
  });

  res.json({
    upvoteCount: complaint.upvoteCount,
    priority: complaint.priority,
  });
});


// Citizen → submit feedback
export const submitFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params; // complaintId
  const { rating, comment } = req.body;
  const userId = req.user._id;


  // ✅ Strict rating validation
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be a number between 1 and 5");
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }
  
  // ✅ Ownership check
  if (!complaint.citizen.equals(userId)) {
    throw new ApiError(403, "You can only give feedback on your own complaints");
  }
  
  // ✅ Feedback allowed after RESOLVED or CLOSED
  if (!["RESOLVED", "CLOSED"].includes(complaint.status)) {
    throw new ApiError(
      400,
      "Feedback can only be submitted after complaint is resolved or closed"
    );
  }

  // ✅ Prevent duplicate feedback
  const existingFeedback = await Feedback.findOne({
    complaint: id,
    user: userId,
  });

  if (existingFeedback) {
    throw new ApiError(
      400,
      "You have already submitted feedback for this complaint"
    );
  }

  // ✅ Create feedback
  const feedback = await Feedback.create({
    complaint: id,
    user: userId,
    rating,
    comment,
  });

  complaint.feedback = feedback._id;
  await complaint.save();

  // 🏆 Reward for feedback
  await addRewardPoints({
  userId,
  points: 3,
  reason: "FEEDBACK_GIVEN",
  complaintId: complaint._id,
});

  return res.status(201).json(
    new ApiResponse({
      message: "Feedback submitted successfully",
      data: { feedback },
    })
  );
});

//feed
export const getFeed = asyncHandler(async (req, res) => {
  const { role, location } = req.user;

  // Base filter → only complaints with attachments
  let filter = {
    attachments: { $exists: true, $not: { $size: 0 } },
  };

  // 🟢 DISTRICT LEVEL
  if (
    ["CITIZEN", "OFFICER", "DEPT_HEAD", "DISTRICT_ADMIN"].includes(role)
  ) {
    if (!location?.district) {
      return res.status(400).json({
        message: "User district not found",
      });
    }

    filter["location.district"] = {
      $regex: `^${location.district}$`,
      $options: "i",
    };
  }

  // 🔵 STATE LEVEL
  else if (role === "STATE_ADMIN") {
    if (!location?.state) {
      return res.status(400).json({
        message: "User state not found",
      });
    }

    filter["location.state"] = {
      $regex: `^${location.state}$`,
      $options: "i",
    };
  }

  // 🔴 CENTRAL / SUPER → ALL INDIA
  else if (["CENTRAL_ADMIN", "SUPER_ADMIN"].includes(role)) {
    // no extra filter
  }

  else {
    return res.status(403).json({
      message: "Role not allowed to view feed",
    });
  }

  const complaints = await Complaint.find(filter)
    .populate("citizen", "name avatar")
    .sort({ createdAt: -1 });

  // 🔥 Sort by upvotes length (reliable)
  complaints.sort(
    (a, b) => b.upvotes.length - a.upvotes.length
  );

  res.status(200).json(complaints);
});