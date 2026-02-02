import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Municipal from "../models/municipal.model.js";
import dotenv from "dotenv";

dotenv.config();

/* ---------- path helpers ---------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------- load json manually ---------- */
const rawPath = path.join(__dirname, "../data/municipals.json");
const rawData = JSON.parse(fs.readFileSync(rawPath, "utf-8"));

/* ---------- mongo connect ---------- */
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ MongoDB connected");

/* ---------- seed ---------- */
for (const m of rawData) {
  await Municipal.updateOne(
    {
      "location.state": m.state.toLowerCase(),
      "location.district": m.district.toLowerCase(),
    },
    {
      $setOnInsert: {
        name: m.name,
        code: m.code.toUpperCase(),
        location: {
          state: m.state.toLowerCase(),
          district: m.district.toLowerCase(),
          city: m.city?.toLowerCase() || null,
        },
        isActive: true,
      },
    },
    { upsert: true }
  );
}

console.log("✅ Municipal seeding done");
process.exit();
