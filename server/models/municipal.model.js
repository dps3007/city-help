import mongoose, { Schema } from "mongoose";

const municipalSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String, // e.g. "BMC", "BBMC"
      unique: true,
      uppercase: true,
      index: true,
    },

    // MATCH USER + COMPLAINT LOCATION (lowercase)
    location: {
      state: {
        type: String,
        required: true,
        lowercase: true,
        index: true,
      },
      district: {
        type: String,
        required: true,
        lowercase: true,
        index: true,
      },
      city: {
        type: String,
        lowercase: true,
        index: true,
      },
    },

    // GEO BOUNDARY (NO HARD CODE)
    boundary: {
      type: {
        type: String,
        enum: ["Polygon"],
        required: true,
      },
      coordinates: {
        type: [[[Number]]], // GeoJSON Polygon
        required: true,
      },
    },

    // Optional metadata
    contactEmail: String,
    contactPhone: String,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// IMPORTANT INDEX (FOR GEO QUERY)
municipalSchema.index({ boundary: "2dsphere" });

export default mongoose.model("Municipal", municipalSchema);
