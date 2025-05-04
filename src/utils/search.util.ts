import { Model } from "mongoose";
import AppError from "@utils/appError";

interface SearchOptions<T> {
  model: Model<T>;
  keyword: string;
  searchFields: string[]; // e.g. ['projectTitle', 'client.clientName']
  populateFields?: string[]; // e.g. ['client']
  selectFields?: string; // e.g. 'projectTitle client.clientName'
}

export const search = async <T>({
  model,
  keyword,
  searchFields,
  populateFields = [],
  selectFields = "",
}: SearchOptions<T>): Promise<T[]> => {
  if (!keyword || keyword.trim().length < 2) {
    throw new AppError("Search query must be at least 2 characters long", 400);
  }

  const regex = new RegExp(keyword, "i");

  // Build $or query for both direct and populated fields
  const orConditions = searchFields.map((field) => {
    const fieldParts = field.split(".");
    if (fieldParts.length > 1) {
      // For populated fields (e.g., client.clientName), we use dot notation in $expr
      return {
        $expr: {
          $regexMatch: {
            input: `$${field}`,
            regex: regex,
          },
        },
      };
    } else {
      return { [field]: regex };
    }
  });

  const pipeline: any[] = [];

  // Stage 1: Match non-deleted documents
  pipeline.push({ $match: { deletedAt: null } });

  // Stage 2: Optional populate using $lookup
  for (const field of populateFields) {
    pipeline.push({
      $lookup: {
        from: field + "s", // assuming plural collection names (e.g. 'clients')
        localField: field,
        foreignField: "_id",
        as: field,
      },
    });

    pipeline.push({
      $unwind: { path: `$${field}`, preserveNullAndEmptyArrays: true },
    });
  }

  // Stage 3: Apply search
  pipeline.push({ $match: { $or: orConditions } });

  // Stage 4: Optional select
  if (selectFields) {
    const projection = selectFields
      .split(" ")
      .reduce((acc, field) => ({ ...acc, [field]: 1 }), {});
    pipeline.push({ $project: projection });
  }

  return await model.aggregate(pipeline);
};
