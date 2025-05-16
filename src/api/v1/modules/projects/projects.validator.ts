import { z } from "zod";
import { validate } from "@middlewares/validate.middleware";

export const createProjectSchema = z.object({
  projectId: z
    .string()
    .min(4, { message: "Invalid project id, must be at least 4 characters" }),
  title: z.string().min(1, { message: "Project title is required" }),
  type: z.string().min(1, { message: "Project type is required" }),
  category: z.string().min(1, { message: "Project category is required" }),
  clientName: z.string().min(1, { message: "Project client name is required" }),
  client: z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: "Please provide a valid client Id",
  }),
  scope: z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: "Please provide a valid scope Id",
  }),
  createdBy: z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: "Please provide a valid createdBy Id",
  }),
});

export const updateProjectSchema = z.object({
  quotation: z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: "Please provide a valid quotation Id",
  }),
  siteVisits: z.array(
    z.string().regex(/^[0-9a-fA-F]{24}$/, {
      message: "Please provide a valid site visit Id",
    })
  ),
  status: z.enum(["active", "completed", "paused", "cancelled"]).optional(),
  progress: z.number().optional(),
  startDate: z.coerce.date().optional(),
  expectedCompletionDate: z.coerce.date().optional(),
});

export const validateCreateProject = validate(createProjectSchema);
export const validateUpdateProject = validate(updateProjectSchema);
