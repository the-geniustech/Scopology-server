import { validate } from "@middlewares/validate.middleware";
import { z } from "zod";

const base64ImageRegex = /^data:image\/(png|jpeg);base64,/;

export const createToolboxSchema = z.object({
  project: z
    .string({ required_error: "Project ID is required" })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid projectId"),
  projectName: z.string({ required_error: "Project name is required" }),
  jobNumber: z.string({ required_error: "Job number is required" }),
  jobLocation: z.string({ required_error: "Job location is required" }),

  date: z
    .string({ required_error: "Meeting date is required" })
    .datetime("Date must be a valid ISO string"),

  time: z
    .string({ required_error: "Meeting time is required" })
    .regex(/^([1-9]|1[0-2]):[0-5][0-9](AM|PM)$/i, {
      message: "Time must be in 12-hour format (e.g., 9:45AM)",
    }),

  numberOfCrew: z
    .number({ required_error: "Crew number is required" })
    .int("Must be an integer")
    .min(1, "At least one crew member required"),

  supervisor: z.string({ required_error: "Supervisor name is required" }),
  completedBy: z.string({ required_error: "Completed by name is required" }),
  topicDiscussed: z.string({ required_error: "Topic is required" }),

  additionalNotes: z.string().optional(),

  documentNumber: z.string({ required_error: "Document number is required" }),
  issueDate: z
    .string({ required_error: "Issue date is required" })
    .datetime("Issue date must be in ISO datetime format"),

  revisionNumber: z
    .string({ required_error: "Revision number is required" })
    .regex(/^\d+$/, "Revision number must be numeric"),

  acknowledgements: z
    .array(
      z.object({
        fullName: z
          .string({ required_error: "Employee name is required" })
          .min(2, "Employee name must be at least 2 characters"),
        signature: z
          .string({ required_error: "Signature is required" })
          .regex(base64ImageRegex, {
            message: "Signature must be a valid base64-encoded image",
          }),
      }),
      {
        required_error: "At least one acknowledgement is required",
      }
    )
    .min(1, "At least one acknowledgement must be recorded"),

  foremanOrSupervisorSignature: z
    .string({ required_error: "Supervisor signature is required" })
    .regex(base64ImageRegex, {
      message: "Signature must be a valid base64-encoded image",
    }),

  conductedBySignature: z
    .string({ required_error: "Conducted by signature is required" })
    .regex(base64ImageRegex, {
      message: "Signature must be a valid base64-encoded image",
    }),
});

export const validateToolboxForm = validate(createToolboxSchema);
export const validateUpdateToolboxForm = validate(
  createToolboxSchema.partial()
);
