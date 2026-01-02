import Joi from 'joi';

export const manageUserSchema = Joi.object({
  userId: Joi.string().required(),
  action: Joi.string()
    .valid('BLOCK', 'UNBLOCK', 'DELETE')
    .required(),
});
