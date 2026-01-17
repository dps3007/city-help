import Joi from "joi";

// Validation schema for managing user roles
export const manageUserSchema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.string()
    .valid(
      "CITIZEN",
      "WORKER",
      "OFFICER",
      "DEPT_HEAD",
      "DISTRICT_ADMIN",
      "STATE_ADMIN",
      "CENTRAL_ADMIN",
      "SUPER_ADMIN"
    )
    .required(),
});
