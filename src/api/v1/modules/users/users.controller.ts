import { Request, Response, NextFunction } from "express";
import * as UserService from "./users.service";
import { catchAsync } from "@utils/catchAsync";
import { sendSuccess } from "@utils/responseHandler";
import AppError from "@utils/appError";
import { APIFeatures } from "@utils/apiFeatures.util";
import User from "@models/User.model";
import { search } from "../../../../utils/search.util";
import { getNextSequenceIdPreview } from "@utils/sequentialIdGenerator.util";
import { idFormatConfig } from "@constants/idPrefixes";

export const previewNextUserId = catchAsync(
  async (req: Request, res: Response) => {
    const sequenceOptions = idFormatConfig["User"];
    const nextId = await getNextSequenceIdPreview("User", sequenceOptions);

    return sendSuccess({
      res,
      message: "Next available userId (preview)",
      data: { nextUserId: nextId },
    });
  }
);

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const baseUrl = `${req.baseUrl}${req.path}`;
  const features = new APIFeatures(User.find({ deletedAt: null }), req.query);
  const { data: users, pagination } =
    await features.applyAllFiltersWithPaginationMeta(baseUrl);

  return res.status(200).json({
    status: "success",
    message: "Users retrieved successfully",
    pagination,
    results: users.length,
    data: { users },
  });
});

export const getUserStatsController = catchAsync(
  async (_req: Request, res: Response) => {
    const stats = await UserService.getUserStats();

    sendSuccess({
      res,
      message: "User stats retrieved successfully",
      data: stats,
    });
  }
);

export const searchUsers = catchAsync(async (req: Request, res: Response) => {
  const keyword = req.query.q as string;

  const users = await search(
    User,
    keyword,
    ["fullName", "email", "phoneNumber"],
    "userId fullName email phoneNumber roles"
  );

  return sendSuccess({
    res,
    message: "User search results",
    results: users.length,
    data: { users },
  });
});

export const getUserByUserId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = parseInt(req.params.userId, 10);
    const user = await UserService.getUserByUserId(userId);

    if (!user)
      return next(new AppError(`User with ID ${userId} not found`, 404));

    return sendSuccess({
      res,
      data: { user },
    });
  }
);

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

export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserService.updateUserById(req.params.id, req.body);

    if (!user)
      return next(new AppError("User not found or update failed", 404));

    return sendSuccess({
      res,
      message: "User updated successfully",
      data: { user },
    });
  }
);

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
