import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";


   //REGISTER (CITIZEN ONLY)

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  await User.create({
    name,
    email,
    password,
    role: "CITIZEN", // 🔒 forced
  });

  return res.status(201).json(
    new ApiResponse({message: "User registered successfully"})
  );
});

  // LOGIN
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshTokens.push(refreshToken);
  await user.save({ validateBeforeSave: false });
  
  return res.status(200).json(
    new ApiResponse({
      message: "Login successful",
      data: { 
        accessToken, 
        refreshToken 
      }, 
    })
  );
});
 //  REFRESH TOKEN

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token required");
  }

  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch {
    throw new ApiError(403, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded._id);
  if (!user || !user.refreshTokens.includes(refreshToken)) {
    throw new ApiError(403, "Refresh token not recognized");
  }

  const newAccessToken = user.generateAccessToken();

  return res.status(200).json(
    new ApiResponse({ data : {accessToken: newAccessToken} }, "Token refreshed")
  );
});

  // LOGOUT (SINGLE DEVICE)

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token required");
  }

  const user = await User.findOne({ refreshTokens: refreshToken });

  
  if (user) {
    user.refreshTokens = user.refreshTokens.filter(
      (t) => t !== refreshToken
    );

    await user.save({ validateBeforeSave: false });
  }

  return res.status(200).json(
    new ApiResponse({
      message: "Logged out successfully",
    })
  );
});
