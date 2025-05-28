import { ObjectId, Document } from "mongoose";

export type TaskStatus =
  | "not-started"
  | "in-progress"
  | "completed"
  | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskSource = "manual" | "gantt" | "scope-import";

export interface ITask {
  taskId: string;
  project: ObjectId;
  title: string;
  description?: string;
  color?: string;
  assignees: ObjectId[];
  status: TaskStatus;
  priority: TaskPriority;
  order: number;
  progress: number;
  type?: string;
  startDate: Date;
  dueDate: Date;
  duration?: number;
  durationRange?: "hourly" | "daily" | "weekly" | "monthly" | "yearly";
  completedAt?: Date | null;
  addedBy: ObjectId;
  source: TaskSource;
  dependencies?: ObjectId[];
  deletedAt?: Date | null;
}

export interface ITaskDocument extends ITask, Document {}
