import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new Schema(
  {
    // 🖼️ Profile Avatar
    avatar: {
      url: { type: String, default: 'https://placehold.co/200x200/png' },
      localPath: { type: String, default: '' },
    },

    // 📧 Basic Info
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // prevent password from being returned by default
    },

    // ✅ Verification & Session Tokens
    isEmailVerified: { type: Boolean, default: false },
    refreshTokens: {
      type: [String],
      default: [],
      validate: {
        validator: arr => arr.length <= 5,
        message: 'Exceeded maximum number of active sessions',
      },
    },
    passwordResetToken: { type: String, default: null },
    passwordResetTokenExpiry: { type: Date, default: null },
    emailVerificationToken: { type: String, default: null },
    emailVerificationTokenExpiry: { type: Date, default: null },

    // 🧩 Role Hierarchy
    role: {
      type: String,
      enum: [
        'citizen',
        'departmentHead',
        'districtAdmin',
        'stateAdmin',
        'centralAdmin',
        'superAdmin',
      ],
      default: 'citizen',
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // 🌍 Location Info
    address: { type: String },
    city: { type: String },
    district: { type: String },
    state: { type: String },
    pincode: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },

    // 🏅 Gamified System
    communityPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

//
// 🔐 PASSWORD HASHING
//
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

//
// 🔍 PASSWORD COMPARISON
//
userSchema.methods.isPasswordMatch = async function (password) {
  if (!password || !this.password) return false;
  return await bcrypt.compare(password, this.password);
};

//
// 🔑 JWT ACCESS TOKEN
//
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d' }
  );
};

//
// 🔑 JWT REFRESH TOKEN
//
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  });
};

//
// 🔑 TEMPORARY TOKEN GENERATOR
//
userSchema.methods.generateTemporaryToken = function () {
  const unhashedToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(unhashedToken)
    .digest('hex');
  const tokenExpiry = Date.now() + 20 * 60 * 1000; // 20 minutes
  return { unhashedToken, hashedToken, tokenExpiry };
};

//
// 📧 EMAIL VERIFICATION TOKEN
//
userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = token;
  this.emailVerificationTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
  return token;
};

//
// 🔐 PASSWORD RESET TOKEN
//
userSchema.methods.generatePasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');
  this.passwordResetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
  return rawToken;
};

//
// ✅ EXPORT MODEL
//
const User = mongoose.model('User', userSchema);
export default User;
