import { z } from "zod";
import { validate } from "@middlewares/validate.middleware";
export const createQuotationSchema = z.object({
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: "Please provide a valid project Id",
  }),
  employeeSkillset: z.array(z.string()).min(1, "Employee skillset is required"),
  employeeRate: z.number().min(0),
  workingDays: z.object({
    weekdays: z.number().min(0),
    saturdays: z.number().min(0),
    sundays: z.number().min(0),
    publicHolidays: z.number().min(0),
  }),
  equipmentsAndTools: z.array(z.string()),
  consumables: z.array(z.string()),
  subcontractors: z.array(z.string()),
  suppliers: z.array(z.string()),
  materials: z.array(z.string()),
  others: z.string().optional(),
});

export const validateQuotationCreation = validate(createQuotationSchema);
