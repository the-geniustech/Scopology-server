import { Request, Response, NextFunction } from "express";
import * as UserService from "./users.service";
import { catchAsync } from "@utils/catchAsync";
import { sendSuccess } from "@utils/responseHandler";
import AppError from "../../../../utils/appError";

export const previewNextUserId = catchAsync(async (_req, res) => {
  const nextId = await UserService.getNextUserIdPreview();

  return sendSuccess({
    res,
    message: "Next available userId (preview)",
    data: { nextUserId: nextId },
  });
});

/**
 * Register a new user
 */
export const registerUser = catchAsync(async (req: Request, res: Response) => {
  // Step 1: preview current userId
  const nextUserId = await UserService.getNextUserIdPreview();

  // Step 2: attach it to the user being created
  const user = await UserService.createUser({
    ...req.body,
    userId: nextUserId,
  });

  // Step 3: commit to incrementing the counter
  await UserService.incrementUserIdCounter();

  return sendSuccess({
    res,
    statusCode: 201,
    message: "User created successfully",
    data: user,
  });
});

/**
 * Get all users
 */
export const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
  const users = await UserService.getAllUsers();
  return sendSuccess({
    res,
    message: "Users fetched successfully",
    data: users,
    results: users.length,
  });
});

/**
 * Get user by sequential userId
 */
export const getUserByUserId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = parseInt(req.params.userId, 10);
    const user = await UserService.getUserByUserId(userId);

    if (!user)
      return next(new AppError(`User with ID ${userId} not found`, 404));

    return sendSuccess({
      res,
      data: user,
    });
  }
);

/**
 * Get user by email
 */
export const getUserByEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const email = req.params.email;
    const user = await UserService.getUserByEmail(email);

    if (!user)
      return next(new AppError(`User with email "${email}" not found`, 404));

    return sendSuccess({
      res,
      data: user,
    });
  }
);

/**
 * Update user by _id
 */
export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserService.updateUserById(req.params.id, req.body);

    if (!user)
      return next(new AppError("User not found or update failed", 404));

    return sendSuccess({
      res,
      message: "User updated successfully",
      data: user,
    });
  }
);

/**
 * Soft delete user by _id
 */
export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deleted = await UserService.softDeleteUser(req.params.id);

    if (!deleted)
      return next(new AppError("User not found or already deleted", 404));

    return sendSuccess({
      res,
      message: "User soft-deleted successfully",
    });
  }
);
