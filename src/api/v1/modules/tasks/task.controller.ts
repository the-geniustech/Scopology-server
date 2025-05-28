import { Request, Response } from "express";
import { catchAsync } from "@utils/catchAsync";
import { sendSuccess } from "@utils/responseHandler";
import * as TaskService from "./task.service";
import { IUserDocument } from "@interfaces/user.interface";
import Task from "@models/Task.model";
import AppError from "@utils/appError";
import { APIFeatures } from "@utils/apiFeatures.util";

export const createTask = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDocument;

  const task = await TaskService.createTask({
    ...req.body,
    addedBy: user.id,
  });

  return sendSuccess({
    res,
    statusCode: 201,
    message: "Task created successfully",
    data: { task },
  });
});

export const getTasksByProjectId = catchAsync(
  async (req: Request, res: Response) => {
    const { projectId } = req.params;

    const features = new APIFeatures(
      Task.find({ project: projectId, deletedAt: null })
        .populate("assignees", "fullName email")
        .populate("project", "title"),
      req.query
    );

    const { data: tasks } = await features.applyAllFiltersWithPaginationMeta(
      `${req.baseUrl}${req.path}`
    );

    return sendSuccess({
      res,
      message: "Tasks retrieved successfully",
      results: tasks.length,
      data: { tasks },
    });
  }
);

export const updateTask = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId || req.body.taskId;

  if (!taskId) {
    throw new AppError("Task ID is required", 400);
  }

  if (!/^[0-9a-fA-F]{24}$/.test(taskId)) {
    throw new AppError("Invalid Task ID format", 400);
  }

  const task = await Task.findByIdAndUpdate(
    taskId,
    {
      ...req.body,
      updatedAt: new Date(),
    },
    { new: true }
  );

  if (!task) {
    throw new AppError("Task not found or already deleted", 404);
  }

  return sendSuccess({
    res,
    message: "Task updated successfully",
    data: { task },
  });
});

export const markTaskAsDone = catchAsync(
  async (req: Request, res: Response) => {
    const { taskId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(taskId)) {
      throw new AppError("Invalid Task ID format", 400);
    }

    const task = await Task.findOne({ _id: taskId, deletedAt: null });
    if (!task) {
      throw new AppError("Task not found or already deleted", 404);
    }

    if (task?.status === "completed") {
      throw new AppError("Task is already marked as completed", 400);
    }

    task.status = "completed";
    task.completedAt = new Date();
    await task.save({ validateModifiedOnly: true });

    return sendSuccess({
      res,
      message: "Task marked as completed",
      data: { task: task.toObject() },
    });
  }
);

export const duplicateTask = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { id: userId } = req.user as IUserDocument;

  const newTask = await TaskService.duplicateTask(taskId, userId);

  return sendSuccess({
    res,
    statusCode: 201,
    message: "Task duplicated successfully",
    data: { task: newTask },
  });
});

export const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = req.params;

  if (!/^[0-9a-fA-F]{24}$/.test(taskId)) {
    throw new AppError("Invalid Task ID format", 400);
  }

  const task = await Task.findByIdAndDelete(taskId);
  if (!task) {
    throw new AppError("Task not found or already deleted", 404);
  }
  return sendSuccess({
    res,
    message: "Task deleted successfully",
  });
});

export const archiveTask = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = req.params;

  const task = await Task.findOneAndUpdate(
    { taskId, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );

  if (!task) {
    throw new AppError("Task not found or already archived", 404);
  }

  return sendSuccess({
    res,
    message: "Task archived successfully",
    data: { task },
  });
});

export const restoreTask = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = req.params;

  const task = await Task.findOneAndUpdate(
    { taskId, deletedAt: { $ne: null } },
    { deletedAt: null },
    { new: true }
  );

  if (!task) {
    throw new AppError("Task not found or not archived", 404);
  }

  return sendSuccess({
    res,
    message: "Task restored successfully",
    data: { task },
  });
});
