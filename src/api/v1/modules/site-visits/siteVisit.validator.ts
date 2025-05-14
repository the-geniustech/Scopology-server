import { z } from "zod";
import { validate } from "@middlewares/validate.middleware";

export const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9](AM|PM)$/i;

export const createSiteVisitSchema = z.object({
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid projectId"),
  clientRepresentative: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid client representative Id"),
  contactMethod: z
    .string()
    .min(2, { message: "Please provide contact method" }),
  siteVisitDate: z.coerce.date(),
  siteVisitTime: z.string().regex(timeRegex, {
    message: "siteVisitTime must be in format HH:MMAM/PM",
  }),
  commuteTime: z.string().regex(timeRegex, {
    message: "commuteTime must be in format HH:MMPM/AM",
  }),
  addedBy: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid addedBy user id"),
});

export type CreateSiteVisitInput = z.infer<typeof createSiteVisitSchema>;
export const validateCreateSiteVisit = validate(createSiteVisitSchema);
