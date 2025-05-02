import { validate } from "@middlewares/validate.middleware";
import { z } from "zod";

export const createScopeSchema = z.object({
  entryRequirements: z.array(z.string()).optional(),
  natureOfWork: z.string(),
  isUploadedScopes: z.boolean().optional(),
  uploadedScopes: z
    .array(
      z.object({
        publicId: z.string(),
        url: z.string(),
      })
    )
    .optional(),
  projectTitle: z.string(),
  projectDescription: z.string(),
  scopeId: z.string(),
  addedBy: z.string(),
  client: z.string(),
});

const updateScopeSchema = z.object({
  entryRequirements: z.array(z.string()).optional(),
  natureOfWork: z.string().optional(),
  isUploadedScopes: z.boolean().optional(),
  uploadedScopes: z.array(z.any()).optional(),
  projectTitle: z.string().optional(),
  projectDescription: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export const validateCreateScope = validate(createScopeSchema);
export const validateUpdateScope = validate(updateScopeSchema);
