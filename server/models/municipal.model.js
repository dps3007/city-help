import mongoose, { Schema } from "mongoose";

const municipalSchema = new Schema(
  {
    name: {
      type: String,           // "Meerut Nagar Nigam"
      required: true,
      trim: true,
      index: true,
    },

    code: {
      type: String,           // MNN, BMC, MCD
      uppercase: true,
      index: true,
    },

    location: {
      state: { type: String, lowercase: true, index: true },
      district: { type: String, lowercase: true, index: true },
      city: { type: String, lowercase: true, index: true },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

municipalSchema.index(
  {
    "location.state": 1,
    "location.district": 1,
  },
  { unique: true }
);

export default mongoose.model("Municipal", municipalSchema);
