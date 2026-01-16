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

router.get(
  "/me",
  verifyJWT,
  getMyNotifications
);

router.patch(
  "/:id/read",
  verifyJWT,
  markAsRead
);

router.patch(
  "/read-all",
  verifyJWT,
  markAllAsRead
);

router.get(
  "/unread-count",
  verifyJWT,
  getUnreadCount
);

router.delete(
  "/:id",
  verifyJWT,
  deleteNotification
);

export default router;
