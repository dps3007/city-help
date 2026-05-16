import { io } from "../socket.js";
import { redis } from "../config/redis.js";
import asyncHandler from "../utils/asyncHandler.js";
import Complaint from "../models/complaint.model.js";
import { addRewardPoints } from "./reward.controller.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { sendNotification } from "./notification.controller.js";
import User from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import Municipal from "../models/municipal.model.js";

const invalidateCacheSafely = async (...keys) => {
  try {
    await Promise.all(keys.map((key) => redis.del(key)));
  } catch (error) {
    console.warn("Complaint cache invalidation failed:", error.message);
  }
};


export const getAllComplaints = asyncHandler(async (req, res) => {

  const { department } = req.query;
  const { role, location } = req.user;

  const filter = {};

  if (req.user.municipalId) {
    filter.municipalId = req.user.municipalId;
  }

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

  //  DISTRICT ADMIN
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

  // CITY ADMIN (future-safe)
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

export const createComplaint = asyncHandler(async (req, res) => {
  const { category, description, location: locationStr } = req.body;
  const file = req.file;

  if (!file) {
    throw new ApiError(400, "Complaint image is required");
  }

  /* ------------------ PARSE LOCATION ------------------ */
  let location;
  try {
    location =
      typeof locationStr === "string"
        ? JSON.parse(locationStr)
        : locationStr;
  } catch {
    throw new ApiError(400, "Invalid location format");
  }

  const lat = location?.coordinates?.lat;
  const lng = location?.coordinates?.lng;

  if (typeof lat !== "number" || typeof lng !== "number") {
    throw new ApiError(400, "Valid location coordinates required");
  }

  /* ------------------ DUPLICATE DETECTION ------------------ */
  const ACTIVE_STATUSES = [
    "SUBMITTED",
    "VERIFIED",
    "ASSIGNED",
    "IN_PROGRESS",
  ];

  const existingComplaint = await Complaint.findOne({
    category,
    status: { $in: ACTIVE_STATUSES },
    "location.geo": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: 100, // meters
      },
    },
  });

  /* ------------------ IF DUPLICATE → LINK USER ------------------ */
  if (existingComplaint) {
    existingComplaint.supporters.addToSet(req.user._id);
    existingComplaint.upvotes.addToSet(req.user._id);

    await existingComplaint.save();

    return res.status(409).json(
      new ApiResponse({
        message:
          "Complaint already exists. You are now linked to this complaint.",
        data: {
          complaint: existingComplaint,
          duplicate: true,
        },
      })
    );
  }

  /* ------------------ IMAGE UPLOAD ------------------ */
  const upload = await uploadToCloudinary(file.buffer);

  const attachments = [
    {
      url: upload.secure_url,
      type: "IMAGE",
    },
  ];

  /* ------------------ CREATE COMPLAINT ------------------ */
  const complaint = await Complaint.create({
    citizen: req.user._id,
    category,
    description,
    attachments,
    location: {
      localAddress: location.localAddress || "",
      city: location.city || "",
      district: location.district || "",
      state: location.state || "",
      pincode: location.pincode || "",   // 👈 Mapbox postcode → pincode
      autoDetected: true,                // 👈 Mapbox auto-detect
      geo: {
        type: "Point",
        coordinates: [lng, lat],
      },
    },
    supporters: [],
    feedback: [],
  });

  /* ------------------ MUNICIPAL AUTO-DETECTION ------------------ */
  if (location.state && location.district) {
    const municipal = await Municipal.findOne({
      "location.state": location.state.toLowerCase(),
      "location.district": location.district.toLowerCase(),
      isActive: true,
    });

    if (municipal) {
      complaint.municipalId = municipal._id;
      await complaint.save();
    }
  }

  const citizen = req.user;
  const complaintTitle = complaint.description.substring(0, 60);
  
  await sendNotification({
    userId: citizen._id,
    name: citizen.name,
    title: "Complaint Submitted Successfully",
    message: `Your complaint "${complaintTitle}" has been successfully submitted and is now under review.`,
    type: "STATUS",
    event: "COMPLAINT_SUBMITTED",
    email: citizen.email,
    complaintId: complaint._id,
    complaintDetails: {
      id: complaint._id?.toString() || "N/A",
      category: complaint.category || "N/A",
      description: (complaint.description || "No description").substring(0, 100) + "...",
      location: `${complaint.location?.district || "N/A"}, ${complaint.location?.state || "N/A"}`,
      status: complaint.status || "SUBMITTED",
    },
    actionUrl: `${process.env.CLIENT_URL}/complaints/${complaint._id}`,
    actionText: "View Complaint",
  });

  await invalidateCacheSafely("dashboard:*", "feed:*");

  return res.status(201).json(
    new ApiResponse({
      message: "Complaint created successfully",
      data: {
        complaint,
        duplicate: false,
      },
    })
  );
});

// Get complaints for current user (citizen or officer)
export const getComplaints = asyncHandler(async (req, res) => {
  const user = req.user;
  let filter = {};

  /* ================= CITIZEN ================= */
  if (user.role === "CITIZEN") {
    filter = {
      $or: [
        { citizen: user._id },     // created by user
        { supporters: user._id },  // duplicate-linked
      ],
    };
  }

  /* ================= OFFICER ================= */
  if (user.role === "OFFICER") {
    filter = {
      assignedTo: user._id,
    };
  }

  /* ================= OTHERS (ADMIN ETC) ================= */
  // admins see everything (no filter)

  const complaints = await Complaint.find(filter)
    .populate("verifiedBy", "name email role")
    .populate("assignedTo", "name email role")
    .populate("municipalId", "name code location")
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

  const complaint = await Complaint.findById(id)
    .populate("citizen", "name email avatar")
    .populate("supporters", "name email avatar")
    .populate({
      path: "feedback", 
      populate: {
        path: "user",
        select: "name email avatar"
      }
    })
    .populate("assignedTo", "name email role")
    .populate("verifiedBy", "name email role")
    .populate("municipalId", "name code location");

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // ============= Access Control =============
  
  // For CITIZEN role
  if (user.role === "CITIZEN") {
    const isOwner = complaint.citizen.equals(user._id);
    
    // Proper supporter check
    const isSupporter = complaint.supporters.some(
      (supporter) => supporter._id.equals(user._id)
    );

    if (!isOwner && !isSupporter) {
      throw new ApiError(403, "Access denied");
    }
  }

  // For OFFICER role
  if (
    user.role === "OFFICER" &&
    !complaint.assignedTo?.equals(user._id)
  ) {
    throw new ApiError(403, "Access denied");
  }

  return res.status(200).json( 
    new ApiResponse({ 
      message: "Complaint fetched successfully",
      data: { complaint },
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

  //  Notification
  const complaintTitle1 = (complaint.description || "Your complaint").substring(0, 60);
  await sendNotification({
    userId: citizen._id,
    name: citizen.name,
    title: "Complaint Verified",
    message: `Great! Your complaint "${complaintTitle1}" has been verified by ${officer?.name || "the officer"} and is now in progress.`,
    type: "STATUS",
    event: "COMPLAINT_VERIFIED",
    email: citizen.email,
    complaintId: complaint._id,
    complaintDetails: {
      id: complaint._id?.toString() || "N/A",
      category: complaint.category || "N/A",
      description: (complaint.description || "No description").substring(0, 100) + "...",
      location: `${complaint.location?.district || "N/A"}, ${complaint.location?.state || "N/A"}`,
      status: "VERIFIED",
    },
    actionUrl: `${process.env.CLIENT_URL}/complaints/${complaint._id}`,
    actionText: "Track Progress",
  });

  await invalidateCacheSafely("dashboard:*");

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

  if (complaint.status === "ASSIGNED") {
    return res.status(200).json(
      new ApiResponse({
        message: "Complaint already assigned",
        data: { complaint },
      })
    );
  }

  const citizen = await User.findById(complaint.citizen);
  if (!citizen) {
    throw new ApiError(404, "Citizen not found");
  }

  const officer = await User.findById(officerId);
  if (!officer) {
    throw new ApiError(404, "Officer not found");
  }

  // status enum
  complaint.assignedTo = officerId;
  complaint.status = "ASSIGNED";
  await complaint.save();

  // Officer notification
  const complaintTitle2 = (complaint.description || "A complaint").substring(0, 60);
  await sendNotification({
    userId: officer._id,
    name: officer.name,
    title: `New Complaint Assigned: ${complaintTitle2.substring(0, 40)}`,
    message: `A new complaint "${complaintTitle2}" has been assigned to you from ${citizen?.name || "a citizen"}. Please review and take appropriate action.`,
    type: "ASSIGNMENT", 
    event: "COMPLAINT_ASSIGNED",   
    email: officer.email,
    complaintId: complaint._id,
    complaintDetails: {
      id: complaint._id?.toString() || "N/A",
      category: complaint.category || "N/A",
      description: (complaint.description || "No description").substring(0, 100) + "...",
      location: `${complaint.location?.district || "N/A"}, ${complaint.location?.state || "N/A"}`,
      status: "ASSIGNED",
    },
    actionUrl: `${process.env.CLIENT_URL}/complaints/${complaint._id}`,
    actionText: "View & Start Work",
  });

  // Citizen notification
  await sendNotification({
    userId: citizen._id,
    name: citizen.name,
    title: "Complaint Assigned to Officer",
    message: `Your complaint "${complaintTitle2}" has been assigned to ${officer?.name || "an officer"}. They will start working on it shortly.`,
    type: "ASSIGNMENT",        
    event: "COMPLAINT_ASSIGNED",     
    email: citizen.email,
    complaintId: complaint._id,
    complaintDetails: {
      id: complaint._id?.toString() || "N/A",
      category: complaint.category || "N/A",
      description: (complaint.description || "No description").substring(0, 100) + "...",
      location: `${complaint.location?.district || "N/A"}, ${complaint.location?.state || "N/A"}`,
      status: "ASSIGNED",
    },
    actionUrl: `${process.env.CLIENT_URL}/complaints/${complaint._id}`,
    actionText: "Track Assignment",
  });

  await invalidateCacheSafely("dashboard:*");

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

  const complaintTitle3 = (complaint.description || "Your complaint").substring(0, 60);
  await sendNotification({
    userId: citizen._id,
    name: citizen.name,
    title: "Work Started on Your Complaint",
    message: `Good news! Work has started on your complaint "${complaintTitle3}". Our team is actively working to resolve it.`,
    type: "STATUS",
    event: "COMPLAINT_WORK_STARTED",
    email: citizen.email,
    complaintId: complaint._id,
    complaintDetails: {
      id: complaint._id?.toString() || "N/A",
      category: complaint.category || "N/A",
      description: (complaint.description || "No description").substring(0, 100) + "...",
      location: `${complaint.location?.district || "N/A"}, ${complaint.location?.state || "N/A"}`,
      status: "IN_PROGRESS",
    },
    actionUrl: `${process.env.CLIENT_URL}/complaints/${complaint._id}`,
    actionText: "Monitor Updates",
  });

  await invalidateCacheSafely("dashboard:*");

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
  points: 4,
  reason: "COMPLAINT_RESOLVED",
  complaintId: complaint._id,
});

  // Notification to citizen
  const complaintTitle4 = (complaint.description || "Your complaint").substring(0, 60);
  await sendNotification({
    userId: citizen._id,
    name: citizen.name,
    title: "Complaint Resolved Successfully",
    message: `Excellent! Your complaint "${complaintTitle4}" has been successfully resolved. Thank you for reporting this issue and helping improve our community.`,
    type: "STATUS",       
    event: "COMPLAINT_RESOLVED",   
    email: citizen.email,
    complaintId: complaint._id,
    complaintDetails: {
      id: complaint._id?.toString() || "N/A",
      category: complaint.category || "N/A",
      description: (complaint.description || "No description").substring(0, 100) + "...",
      location: `${complaint.location?.district || "N/A"}, ${complaint.location?.state || "N/A"}`,
      status: "RESOLVED",
    },
    actionUrl: `${process.env.CLIENT_URL}/complaints/${complaint._id}`,
    actionText: "View Resolution Details",
  });

  await invalidateCacheSafely("dashboard:*");

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

  //  Notification to citizen
  const complaintTitle5 = (complaint.description || "Your complaint").substring(0, 60);
  await sendNotification({
    userId: citizen._id,
    name: citizen.name,
    title: "Complaint Case Closed",
    message: `Your complaint "${complaintTitle5}" case has been officially closed. We appreciate your feedback and cooperation in resolving this matter.`,
    type: "STATUS",
    event: "COMPLAINT_CLOSED",         
    email: citizen.email,
    complaintId: complaint._id,
    complaintDetails: {
      id: complaint._id?.toString() || "N/A",
      category: complaint.category || "N/A",
      description: (complaint.description || "No description").substring(0, 100) + "...",
      location: `${complaint.location?.district || "N/A"}, ${complaint.location?.state || "N/A"}`,
      status: "CLOSED",
    },
    actionUrl: `${process.env.CLIENT_URL}/complaints/${complaint._id}`,
    actionText: "View Final Status",
  });

  await invalidateCacheSafely("dashboard:*");

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

  // SINGLE SOURCE OF TRUTH
  io.to("feed:all").emit("complaint:upvote", {
    complaintId: complaint._id.toString(),
    upvoteCount: complaint.upvoteCount,
    priority: complaint.priority,
  });

  await invalidateCacheSafely("feed:*");

  res.json({
    upvoteCount: complaint.upvoteCount,
    priority: complaint.priority,
  });
});

//feed
export const getFeed = asyncHandler(async (req, res) => {
  const { role, location } = req.user;

  const cacheKey = `feed:${role}:${location?.state || "all"}:${location?.district || "all"}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(new ApiResponse({
        message: "Feed retrieved from cache",
        data: JSON.parse(cached),
      }));
    }
  } catch (cacheErr) {
    console.error("Cache retrieval error:", cacheErr);
    // Continue without cache if there's an error
  }

  // Base filter → only complaints with attachments and not closed
  let filter = {
    attachments: { $exists: true, $not: { $size: 0 } },
    status: { $ne: "CLOSED" },
  };

  let sort = { createdAt: -1 };

  // SUPER / CENTRAL → most voted across all complaints
  if (["SUPER_ADMIN", "CENTRAL_ADMIN"].includes(role)) {
    sort = { upvoteCount: -1, createdAt: -1 };
  }

  // STATE → most voted in the state
  else if (role === "STATE_ADMIN") {
    if (!location?.state) {
      throw new ApiError(400, "User state not found. Please update your profile location.");
    }

    filter["location.state"] = {
      $regex: `^${location.state}$`,
      $options: "i",
    };

    sort = { upvoteCount: -1, createdAt: -1 };
  }

  // DISTRICT LEVEL → recent first in their district
  else if (["CITIZEN", "OFFICER", "DEPT_HEAD", "DISTRICT_ADMIN"].includes(role)) {
    if (!location?.district) {
      throw new ApiError(400, "User district not found. Please update your profile location.");
    }

    if (location?.state) {
      filter["location.state"] = {
        $regex: `^${location.state}$`,
        $options: "i",
      };
    }

    filter["location.district"] = {
      $regex: `^${location.district}$`,
      $options: "i",
    };
  }

  else {
    throw new ApiError(403, "Role not allowed to view feed");
  }

  const complaints = await Complaint.find(filter)
    .populate("citizen", "name avatar")
    .sort(sort);

  // Cache the results as JSON string
  try {
    await redis.set(cacheKey, JSON.stringify(complaints), { ex: 30 });
  } catch (cacheErr) {
    console.error("Cache storage error:", cacheErr);
    // Continue without caching if there's an error
  }

  return res.status(200).json(new ApiResponse({
    message: "Feed retrieved successfully",
    data: complaints,
  }));
});
