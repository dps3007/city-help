import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

// 🔴 FORCE dotenv to load server/.env
dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

console.log("MONGO_URI =", process.env.MONGO_URI); // 🔍 debug

if (!process.env.MONGO_URI) {
  throw new Error("❌ MONGO_URI not found in env");
}

await mongoose.connect(process.env.MONGO_URI);

const result = await User.updateMany(
  { isActive: { $exists: false } },
  { $set: { isActive: true } }
);

console.log("✅ Updated users:", result.modifiedCount);
process.exit();
