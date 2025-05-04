import { z } from "zod";
import { validate } from "@middlewares/validate.middleware";

export const createProjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  client: z.string().regex(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(["active", "completed", "paused", "cancelled"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const validateCreateProject = validate(createProjectSchema);
export const validateUpdateProject = validate(updateProjectSchema);
