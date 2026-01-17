import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// User Schema
const userSchema = new Schema(
  {
    avatar: {
      url: { type: String, default: 'https://placehold.co/200x200/png' },
      localPath: { type: String, default: '' },
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: [
        'CITIZEN',
        'OFFICER',
        'DEPT_HEAD',
        'DISTRICT_ADMIN',
        'STATE_ADMIN',
        'CENTRAL_ADMIN',
        'SUPER_ADMIN',
      ],
      default: 'CITIZEN',
      index: true,
    },

    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    address: String,
    city: String,
    district: String,
    state: String,
    pincode: String,

    coordinates: {
      lat: Number,
      lng: Number,
    },

    communityPoints: {
      type: Number,
      default: 0,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    refreshTokens: {
      type: [String],
      default: [],
    },

    passwordResetToken: String,
    passwordResetTokenExpiry: Date,

    emailVerificationToken: String,
    emailVerificationTokenExpiry: Date,
  },
  { timestamps: true }
);

// Pre-save hook to hash password if modified
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// Instance methods
userSchema.methods.isPasswordMatch = function (password) {
  return bcrypt.compare(password, this.password);
};

// JWT Generation Methods
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, role: this.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1d' }
  );
};

// Refresh Token Generation Method
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
};

// Password Reset Token Generation Method
userSchema.methods.generatePasswordResetToken = function () {
  const raw = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(raw)
    .digest('hex');
  this.passwordResetTokenExpiry = Date.now() + 60 * 60 * 1000;
  return raw;
};

export default mongoose.model('User', userSchema);
