import { z } from "zod";
import { validate } from "@middlewares/validate.middleware";

export const createTaskSchema = z.object({
  project: z.string({ required_error: "Project ID is required" }),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  color: z.string().default("#0000FF"),
  assignees: z.array(z.string()).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  order: z.number().int().default(0),
  progress: z.number().min(0).max(100).default(0),
  type: z.string().optional(),
  status: z
    .enum(["not-started", "in-progress", "completed", "blocked"])
    .default("not-started"),
  startDate: z.coerce.date({ message: "Invalid start date format" }),
  dueDate: z.coerce.date({ message: "Invalid due date format" }),
  source: z.enum(["manual", "gantt", "scope-import"]).default("manual"),
  dependencies: z.array(z.string()).optional(),
});

export const updateTaskGanttSchema = z.object({
  taskId: z
    .string({ required_error: "Task ID is required" })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid taskId"),
  color: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  durationRange: z
    .enum(["hourly", "daily", "weekly", "monthly", "yearly"])
    .optional(),
});

export const validateCreateTask = validate(createTaskSchema);
export const updateTaskSchema = createTaskSchema.partial();
export const validateUpdateTask = validate(updateTaskSchema);
