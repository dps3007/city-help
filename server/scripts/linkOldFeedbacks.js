import mongoose from "mongoose";
import dotenv from "dotenv";
import Complaint from "../models/complaint.model.js";
import {Feedback} from "../models/feedback.model.js";

dotenv.config();

const linkOldFeedbacks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB connected");

    const feedbacks = await Feedback.find({});
    console.log(`🔍 Found ${feedbacks.length} feedbacks`);

    for (const fb of feedbacks) {
      const complaint = await Complaint.findById(fb.complaint);

      if (complaint && !complaint.feedback) {
        complaint.feedback = fb._id;
        await complaint.save();
      }
    }

    console.log("All old feedbacks linked");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

linkOldFeedbacks();
