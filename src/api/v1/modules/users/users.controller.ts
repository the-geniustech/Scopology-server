import { Request, Response, NextFunction } from "express";
import * as UserService from "./users.service";
import { catchAsync } from "@utils/catchAsync";
import { sendSuccess } from "@utils/responseHandler";
import AppError from "@utils/appError";
import { APIFeatures } from "@utils/apiFeatures.util";
import { env } from "@config/env";
import User from "@models/User.model";
import { buildSearchQuery } from "../utils/search.util";
import {
  getNextSequenceIdPreview,
  incrementSequenceId,
} from "@models/sequentialIdGenerator.util";
import { idFormatConfig } from "@constants/idPrefixes";
import { sendEmail } from "services/mail";
import { EmailPayload } from "services/mail/mail.interface";
import { generateInviteToken } from "@utils/token.util";

const sequenceOptions = idFormatConfig["User"];

export const inviteUser = catchAsync(async (req: Request, res: Response) => {
  const nextUserId = await getNextSequenceIdPreview("User", sequenceOptions);

  const user = await UserService.createUser({
    ...req.body,
    userId: nextUserId,
    password: nextUserId, // store it hashed (auto in schema)
    status: "pending",
  });

  await incrementSequenceId("User", sequenceOptions);

  // Generate invite token
  const token = generateInviteToken(user._id as string);

  // Construct invite link
  const inviteLink = `${env.CLIENT_APP_URL}/accept-invite?token=${token}`;

  // Send invite email
  await sendEmail({
    to: user.email,
    subject: "You’ve been invited to join Scopology",
    html: `
      <p>Hi ${user.fullName},</p>
      <p>You’ve been invited to join Scopology as a <strong>${user.roles.join(
        ", "
      )}</strong>.</p>
      <p>Click below to accept your invite:</p>
      <p><a href="${inviteLink}">Accept Invite</a></p>
      <p>Your temporary password is <strong>${nextUserId}</strong></p>
    `,
  } as EmailPayload);

  return sendSuccess({
    res,
    statusCode: 201,
    message: "User invited successfully. An invite email has been sent.",
    data: {
      fullName: user.fullName,
      email: user.email,
      userId: user.userId,
      status: user.status,
      roles: user.roles,
    },
  });
});

export const previewNextUserId = catchAsync(async (_req, res) => {
  const nextId = await getNextSequenceIdPreview("User", sequenceOptions);

  return sendSuccess({
    res,
    message: "Next available userId (preview)",
    data: { nextUserId: nextId },
  });
});

/**
 * Get all users
 */
export const getAllUsers = catchAsync(async (req, res) => {
  const baseUrl = `${req.baseUrl}${req.path}`;
  const features = new APIFeatures(User.find({ deletedAt: null }), req.query);
  const { data, pagination } = await features.applyAllFiltersWithPaginationMeta(
    baseUrl
  );

  return res.status(200).json({
    status: "success",
    message: "Users retrieved successfully",
    pagination,
    results: data.length,
    data,
  });
});

export const searchUsers = catchAsync(async (req: Request, res: Response) => {
  const keyword = req.query.q as string;

  if (!keyword || keyword.trim().length < 2) {
    return res.status(400).json({
      status: "fail",
      message: "Search query must be at least 2 characters",
    });
  }

  const query = buildSearchQuery(keyword, ["fullName", "email", "phoneNumber"]);
  const users = await User.find({ deletedAt: null, ...query }).select(
    "userId fullName email phoneNumber roles"
  );

  return sendSuccess({
    res,
    message: "User search results",
    results: users.length,
    data: users,
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
