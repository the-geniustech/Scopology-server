import { validate } from "@middlewares/validate.middleware";
import { z } from "zod";

export const createScopeSchema = z.object({
  entryRequirements: z.array(z.string()).optional(),
  natureOfWork: z.string(),
  isUploadedScopes: z.boolean().optional(),
  projectTitle: z.string(),
  projectDescription: z.string(),
});

const updateScopeSchema = z.object({
  entryRequirements: z.array(z.string()).optional(),
  natureOfWork: z.string().optional(),
  isUploadedScopes: z.boolean().optional(),
  uploadedScopes: z.array(z.any()).optional(),
  projectTitle: z.string().optional(),
  projectDescription: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "in-review"]).optional(),
});

export const validateCreateScope = validate(createScopeSchema);
export const validateUpdateScope = validate(updateScopeSchema);
