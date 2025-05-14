import User from "@models/User.model";
import { IUserDocument } from "@interfaces/user.interface";
import { FilterQuery, UpdateQuery } from "mongoose";

import AppError from "@utils/appError";
import {
  UpdateUserProfileInput,
  UpdateUserPasswordInput,
} from "./users.validator";

import { Counter } from "@models/Counter.model";

export const getNextUserIdPreview = async (): Promise<number> => {
  const counter = await Counter.findById("User");
  return counter ? counter.seq + 1 : 1;
};

export const incrementUserIdCounter = async (): Promise<number> => {
  const counter = await Counter.findByIdAndUpdate(
    "User",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return counter!.seq;
};

export const createUser = async (
  data: Partial<IUserDocument>
): Promise<IUserDocument> => {
  const user = new User(data);
  return await user.save();
};

export const getUserStats = async () => {
  const result = await User.aggregate([
    { $match: { deletedAt: null } },
    {
      $facet: {
        total: [{ $count: "count" }],
        active: [{ $match: { status: "active" } }, { $count: "count" }],
        disabled: [{ $match: { status: "disabled" } }, { $count: "count" }],
      },
    },
    {
      $project: {
        total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
        active: { $ifNull: [{ $arrayElemAt: ["$active.count", 0] }, 0] },
        disabled: { $ifNull: [{ $arrayElemAt: ["$disabled.count", 0] }, 0] },
      },
    },
  ]);

  return result[0] || { total: 0, active: 0, disabled: 0 };
};

export const getUserByEmail = async (
  email: string,
  includePassword = false
): Promise<IUserDocument | null> => {
  return await User.findOne({ email, deletedAt: null }).select(
    includePassword ? "+password" : "-password"
  );
};

export const getUserByUserId = async (
  userId: number
): Promise<IUserDocument | null> => {
  return await User.findOne({ userId, deletedAt: null });
};

export const getUserByObjectId = async (
  _id: string
): Promise<IUserDocument | null> => {
  return await User.findById(_id).where({ deletedAt: null });
};

export const updateUserProfile = async (
  userId: string,
  data: UpdateUserProfileInput
) => {
  const user = await User.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const updateUserPassword = async (
  userId: string,
  data: UpdateUserPasswordInput
) => {
  const user = await User.findById(userId).select("+password");

  if (!user) throw new AppError("User not found", 404);

  const isMatch = await user.comparePassword(data.currentPassword);
  if (!isMatch) throw new AppError("Current password is incorrect", 401);

  user.password = data.newPassword;
  await user.save({ validateModifiedOnly: true });

  return user;
};

export const updateUserById = async (
  _id: string,
  updates: UpdateQuery<IUserDocument>
): Promise<IUserDocument | null> => {
  return await User.findByIdAndUpdate(_id, updates, {
    new: true,
    runValidators: true,
  });
};

export const softDeleteUser = async (
  _id: string
): Promise<IUserDocument | null> => {
  return await User.findByIdAndUpdate(
    _id,
    { deletedAt: new Date(), isActive: false },
    { new: true }
  );
};

export const hardDeleteUser = async (_id: string): Promise<void> => {
  await User.findByIdAndDelete(_id);
};

export const userExists = async (
  filter: FilterQuery<IUserDocument>
): Promise<boolean> => {
  return Boolean(await User.exists({ ...filter, deletedAt: null }));
};
