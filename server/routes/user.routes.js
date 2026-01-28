import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getCurrentUser,
  updateCurrentUser,
  getMyAllComplaints,
  getMyComplaintById,
  updateAvatar 
} from "../controllers/user.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

// get current user
router.get("/me", verifyJWT, getCurrentUser);

//update avtar
router.patch(
  "/me/avatar",
  verifyJWT,
  upload.single("avatar"), 
  updateAvatar
);


// update user
router.patch("/me", verifyJWT, updateCurrentUser);

// get complaints by user
router.get("/my-complaints", verifyJWT, getMyAllComplaints);

// get complaint by id for user
router.get("/my-complaints/:id", verifyJWT, getMyComplaintById);

export default router;
