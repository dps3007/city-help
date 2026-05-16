import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

const [, , emailArg, newPasswordArg] = process.argv;

if (!emailArg || !newPasswordArg) {
  console.error("Usage: node scripts/resetPassword.js <email> <newPassword>");
  process.exit(1);
}

if (newPasswordArg.length < 6) {
  console.error("New password must be at least 6 characters long.");
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI not found in environment.");
  process.exit(1);
}

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = emailArg.trim().toLowerCase();
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      console.error(`User not found for email: ${email}`);
      process.exit(1);
    }

    user.password = newPasswordArg;
    user.refreshTokens = [];
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;
    await user.save();

    console.log(`Password reset successfully for: ${email}`);
    console.log("All refresh tokens were revoked. Please log in again.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to reset password:", error.message);
    process.exit(1);
  }
};

await resetPassword();