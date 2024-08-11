import Joi from "@hapi/joi";

export const authSchema = Joi.object({
  name: Joi.string().required(),
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .lowercase(),
  role: Joi.string().required(),
  organizationName: Joi.string(),
  password: Joi.string().min(6).required(),
  verifyPassword: Joi.ref("password"),
});
