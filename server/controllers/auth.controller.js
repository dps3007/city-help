import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error('User already exists');
  }

  await User.create({
    name,
    email,
    password,
    role: 'CITIZEN', // 🔒 force default role
  });

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

  if (!refreshToken) {
    res.status(400);
    throw new Error('Refresh token required');
  }

  const user = await User.findOne({ refreshTokens: refreshToken });
  if (!user) {
    return res.json({ success: true }); // token already invalid
  }

  user.refreshTokens = user.refreshTokens.filter(
    t => t !== refreshToken
  );

  await user.save();
  res.json({ success: true });
});

