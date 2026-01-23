import Joi from "joi";

// Validation schema for creating a complaint
export const createComplaintSchema = Joi.object({
  category: Joi.string()
    .valid("GARBAGE", "ROADS", "WATER", "STREETLIGHT", "ELECTRICITY", "OTHER")
    .required(),

  description: Joi.string().min(10).max(1000).required(),

  location: Joi.string().optional(), // Allow string format from frontend
}).unknown(true); // Allow extra fields like image
