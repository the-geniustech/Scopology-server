import { Schema, model } from "mongoose";
import { ITaskDocument } from "@interfaces/task.interface";

const taskSchema = new Schema<ITaskDocument>(
  {
    taskId: { type: String, required: true, unique: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true },
    description: { type: String },
    color: { type: String, default: "#0000FF" },
    assignees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed", "blocked"],
      default: "not-started",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    order: { type: Number, required: true, default: 0 },
    progress: { type: Number, default: 0 },
    type: { type: String },
    startDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    duration: { type: Number, default: 0 }, // Duration in days
    durationRange: {
      type: String,
      enum: ["hourly", "daily", "weekly", "monthly", "yearly"],
      default: "days",
    },
    completedAt: {
      type: Date,
    },
    source: {
      type: String,
      enum: ["manual", "gantt", "scope-import"],
      default: "manual",
    },
    dependencies: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

const Task = model<ITaskDocument>("Task", taskSchema);
export default Task;
