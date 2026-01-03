import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getMyNotifications,
  markAsRead,
} from "../controllers/notification.controller.js";

const router = Router();

/* =========================
   USER NOTIFICATION ROUTES
========================= */

// Get all notifications of logged-in user
router.get(
  "/me",
  verifyJWT,
  getMyNotifications
);

// Mark a notification as read
router.patch(
  "/:id/read",
  verifyJWT,
  markAsRead
);

export default router;
