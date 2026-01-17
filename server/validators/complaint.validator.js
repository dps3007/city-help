import Joi from "joi";

// Validation schema for creating a complaint
export const createComplaintSchema = Joi.object({
  category: Joi.string()
    .valid("GARBAGE", "ROADS", "WATER", "STREETLIGHT", "ELECTRICITY", "OTHER")
    .required(),

  description: Joi.string().min(10).max(1000).required(),

  location: Joi.object({
    city: Joi.string().required(),
    district: Joi.string().required(),
    state: Joi.string().required(),
    coordinates: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required(),
    }).required(),
  }).required(),
}).unknown(false);
