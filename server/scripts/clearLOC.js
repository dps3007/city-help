import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

async function cleanupUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected");

    const result = await User.updateMany(
      {},
      {
        $unset: {
          state: "",
          city: "",
          district: "",
        },
      }
    );

    console.log("🧹 Cleanup completed");
    console.log("Matched:", result.matchedCount);
    console.log("Modified:", result.modifiedCount);

    process.exit(0);
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
    process.exit(1);
  }
}

cleanupUsers();
