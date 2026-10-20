const Joi = require("joi");

const userValidation = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "any.required": "Name is required",
  }),

  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please enter a valid email",
    "any.required": "Email is required",
  }),

  phone: Joi.string().trim().pattern(/^[0-9]{10,15}$/).required().messages({
    "string.empty": "Phone number is required",
    "string.pattern.base": "Phone number must contain only 10 to 15 digits",
    "any.required": "Phone number is required",
  }),

  password: Joi.string().trim().min(6).max(128).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),

  confirmPassword: Joi.string().trim().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "string.empty": "Confirm Password is required",
    "any.required": "Confirm Password is required",
  }),

  role: Joi.string().valid("user").optional(),
  isVerified: Joi.boolean().optional(),
}).options({ abortEarly: false });

const loginValidation = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().trim().min(6).required(),
}).options({ abortEarly: false });

const updateProfileValidation = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().email().required(),
  phone: Joi.string().trim().pattern(/^[0-9]{10,15}$/).required(),
}).options({ abortEarly: false });


module.exports = userValidation;
module.exports.loginValidation = loginValidation;
module.exports.updateProfileValidation = updateProfileValidation;
