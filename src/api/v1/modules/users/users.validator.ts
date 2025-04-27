import { z } from "zod";
import { validate } from "@middlewares/validate.middleware";

const rolesEnum = z.enum(["administrator", "supervisor"]);

const updateUserSchema = z.object({
  fullName: z.string().min(3).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(7).optional(),
  password: z.string().min(6).optional(),
  roles: z.array(rolesEnum).optional(),
  isActive: z.boolean().optional(),
});

export const validateUserUpdate = validate(updateUserSchema.partial());
