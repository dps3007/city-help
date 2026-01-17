import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getMyNotifications,
  markAsRead,
  deleteNotification,
  getUnreadCount,
  markAllAsRead
} from "../controllers/notification.controller.js";

const router = Router();

// Citizen / Officer → own notifications
router.get(
  "/me",
  verifyJWT,
  getMyNotifications
);

// Mark notification as read
router.patch(
  "/:id/read",
  verifyJWT,
  markAsRead
);

// Mark all notifications as read
router.patch(
  "/read-all",
  verifyJWT,
  markAllAsRead
);

// Get count of unread notifications
router.get(
  "/unread-count",
  verifyJWT,
  getUnreadCount
);

// Delete a notification by ID
router.delete(
  "/:id",
  verifyJWT,
  deleteNotification
);

export default router;
