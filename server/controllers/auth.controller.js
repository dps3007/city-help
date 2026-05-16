import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";


//REGISTER (CITIZEN ONLY)
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    throw new ApiError(400, "Name, email, password and confirm password are required");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  
  const userRole = "CITIZEN";

  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
  });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshTokens.push(refreshToken);
  await user.save({ validateBeforeSave: false });

  return res.status(201).json(
    new ApiResponse({
      message: "User registered successfully",
      data: { 
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken 
      }, 
    })
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

  // 🔥 IMPORTANT: fetch fresh user WITHOUT password
  const safeUser = await User.findById(user._id).select("-communityPoints");

  return res.status(200).json(
    new ApiResponse({
      message: "Login successful",
      data: {
        user: safeUser, 
        accessToken,
        refreshToken,
      },
    })
  );
});

// FORGOT PASSWORD
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    return res.status(200).json(
      new ApiResponse({
        message: "If an account exists, a password reset token has been generated",
      })
    );
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const data =
    process.env.NODE_ENV === "production"
      ? null
      : {
          resetToken,
        };

  return res.status(200).json(
    new ApiResponse({
      message: "If an account exists, a password reset token has been generated",
      data,
    })
  );
});

// RESET PASSWORD
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password || !confirmPassword) {
    throw new ApiError(400, "Token, password and confirm password are required");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiry: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset token");
  }

  user.password = password;
  user.refreshTokens = [];
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiry = undefined;
  await user.save();

  return res.status(200).json(
    new ApiResponse({
      message: "Password reset successfully. Please log in again",
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


