import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  await User.create(req.body);
  res.status(201).json({ success: true });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.isPasswordMatch(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshTokens.push(refreshToken);
  await user.save();

  res.json({ success: true, accessToken, refreshToken });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(401);
    throw new Error('Refresh token required');
  }

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(decoded._id);
  if (!user || !user.refreshTokens.includes(refreshToken)) {
    res.status(403);
    throw new Error('Invalid refresh token');
  }

  const newAccessToken = user.generateAccessToken();
  res.json({ success: true, accessToken: newAccessToken });
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  req.user.refreshTokens = req.user.refreshTokens.filter(
    t => t !== refreshToken
  );

  await req.user.save();
  res.json({ success: true });
});
