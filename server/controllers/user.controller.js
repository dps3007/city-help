import User from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getMyProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: updatedUser });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json({ success: true, data: users });
});
