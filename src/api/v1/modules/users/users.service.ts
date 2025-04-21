import User from "@models/User.model";
import { IUserDocument } from "../../../../interfaces/user.interface";
import { FilterQuery, UpdateQuery } from "mongoose";

import { Counter } from "../../../../models/Counter.model";
import { APIFeatures } from "@utils/apiFeatures.util";
import QueryString from "qs";

/**
 * Gets the next available userId without incrementing
 */
export const getNextUserIdPreview = async (): Promise<number> => {
  const counter = await Counter.findById("User");
  return counter ? counter.seq + 1 : 1;
};

/**
 * Increments the userId counter after successful creation
 */
export const incrementUserIdCounter = async (): Promise<number> => {
  const counter = await Counter.findByIdAndUpdate(
    "User",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return counter!.seq;
};

/**
 * Creates a new user document.
 * Automatically generates a sequential userId.
 */
export const createUser = async (
  data: Partial<IUserDocument>
): Promise<IUserDocument> => {
  const user = new User(data);
  return await user.save();
};

/**
 * Find a user by email.
 * @param email - user email address
 * @param includePassword - whether to include password in result
 */
export const getUserByEmail = async (
  email: string,
  includePassword = false
): Promise<IUserDocument | null> => {
  return await User.findOne({ email, deletedAt: null }).select(
    includePassword ? "+password" : "-password"
  );
};

/**
 * Find a user by userId (custom sequential ID).
 */
export const getUserByUserId = async (
  userId: number
): Promise<IUserDocument | null> => {
  return await User.findOne({ userId, deletedAt: null }).select("-password");
};

/**
 * Find a user by MongoDB ObjectId.
 */
export const getUserByObjectId = async (
  _id: string
): Promise<IUserDocument | null> => {
  return await User.findById(_id)
    .where({ deletedAt: null })
    .select("-password");
};

/**
 * Update a user's details by MongoDB ObjectId.
 */
export const updateUserById = async (
  _id: string,
  updates: UpdateQuery<IUserDocument>
): Promise<IUserDocument | null> => {
  return await User.findByIdAndUpdate(_id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");
};

/**
 * Soft delete a user by setting deletedAt timestamp.
 */
export const softDeleteUser = async (
  _id: string
): Promise<IUserDocument | null> => {
  return await User.findByIdAndUpdate(
    _id,
    { deletedAt: new Date(), isActive: false },
    { new: true }
  );
};

/**
 * Permanently delete a user (use with caution).
 */
export const hardDeleteUser = async (_id: string): Promise<void> => {
  await User.findByIdAndDelete(_id);
};

/**
 * Check if a user exists with a given filter.
 */
export const userExists = async (
  filter: FilterQuery<IUserDocument>
): Promise<boolean> => {
  return Boolean(await User.exists({ ...filter, deletedAt: null }));
};
