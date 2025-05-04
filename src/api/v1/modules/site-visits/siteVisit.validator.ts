import { z } from "zod";
import { validate } from "@middlewares/validate.middleware";

const contactMethodEnum = z.enum([
  "phone",
  "email",
  "in_person",
  "whatsapp",
  "other",
]);
const siteVisitStatusEnum = z.enum(["scheduled", "done", "cancelled"]);

const createSiteVisitSchema = z.object({
  projectId: z.string().length(24, "Invalid projectId"),
  clientRepresentative: z.string().min(2, "Client rep is required"),
  contactMethod: contactMethodEnum,
  siteVisitAt: z.coerce.date(),
  commuteTimeMinutes: z.number().min(0, "Commute time must be non-negative"),
  notes: z.string().optional(),
});

export const validateCreateSiteVisit = validate(createSiteVisitSchema);
