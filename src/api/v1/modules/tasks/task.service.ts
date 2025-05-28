import Task from "@models/Task.model";
import { ITask } from "@interfaces/task.interface";
import { incrementSequenceId } from "@utils/sequentialIdGenerator.util";
import AppError from "@utils/appError";

export const createTask = async (data: Partial<ITask>): Promise<ITask> => {
  const taskId = await incrementSequenceId("Task", {
    prefix: "TSK",
    length: 5,
  });

  const startDate = new Date(data.startDate!);
  const dueDate = new Date(data.dueDate!);
  if (startDate > dueDate) {
    throw new AppError("Start date cannot be after due date", 400);
  }

  const duration = Math.ceil(
    (dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (duration < 0) {
    throw new AppError("Duration cannot be negative", 400);
  }

  const task = await Task.create({
    ...data,
    taskId,
    startDate,
    dueDate,
    duration,
    durationRange: "dayly",
  });

  return task;
};

export const duplicateTask = async (taskId: string, addedBy: string) => {
  const existingTask = await Task.findByIdAndDelete(taskId, {
    deletedAt: null,
  });

  if (!existingTask) {
    throw new AppError("Original task not found", 404);
  }

  const clone = new Task({
    ...existingTask.toObject(),
    _id: undefined,
    taskId: await incrementSequenceId("Task", {
      prefix: "TSK",
      length: 5,
    }),
    status: "not-started",
    createdAt: undefined,
    updatedAt: undefined,
    startedAt: null,
    completedAt: null,
    addedBy,
  });

  return await clone.save();
};
