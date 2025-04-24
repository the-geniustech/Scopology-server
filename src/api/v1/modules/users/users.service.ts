import User from "@models/User.model";
import { IUserDocument } from "@interfaces/user.interface";
import { FilterQuery, UpdateQuery } from "mongoose";

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
  return await User.findOne({ userId, deletedAt: null }).select("-password");
};

export const getUserByObjectId = async (
  _id: string
): Promise<IUserDocument | null> => {
  return await User.findById(_id)
    .where({ deletedAt: null })
    .select("-password");
};

export const updateUserById = async (
  _id: string,
  updates: UpdateQuery<IUserDocument>
): Promise<IUserDocument | null> => {
  return await User.findByIdAndUpdate(_id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");
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
