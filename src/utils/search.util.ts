import AppError from "@utils/appError";
import { FilterQuery } from "mongoose";
import { Model } from "mongoose";

export const search = async <T>(
  model: Model<T>,
  keyword: string,
  searchFields: string[],
  selectFields?: string
): Promise<T[]> => {
  if (!keyword || searchFields.length === 0) return [];

  if (!keyword || keyword.trim().length < 2) {
    throw new AppError("Search query must be at least 2 characters", 400);
  }

  const regex = new RegExp(keyword, "i");
  const query: any = {
    $or: searchFields.map((field) => ({ [field]: regex })),
    deletedAt: null,
  };

  return model.find(query as FilterQuery<T>).select(selectFields || "");
};
