import { Counter } from "./Counter.model";

interface SequenceOptions {
  prefix?: string;
  length?: number;
}

/**
 * Pads a number with leading zeros
 * Example: 1 -> "0001"
 */
const padId = (num: number, length: number = 4): string => {
  return String(num).padStart(length, "0");
};

/**
 * Builds a padded ID string with optional prefix
 * Example: "USR-0001"
 */
const formatSequenceId = (
  seq: number,
  options: SequenceOptions = {}
): string => {
  const padded = padId(seq, options.length || 4);
  return options.prefix ? `${options.prefix}-${padded}` : padded;
};

/**
 * Gets the next available sequence ID (string), without incrementing
 */
export const getNextSequenceIdPreview = async (
  modelName: string,
  options: SequenceOptions = {}
): Promise<string> => {
  let counter = await Counter.findById(modelName);
  if (!counter) {
    // Create the counter document if it doesn't exist
    counter = await Counter.create({ _id: modelName });
  }
  const next = counter ? counter.seq + 1 : 1;
  return formatSequenceId(next, options);
};

/**
 * Increments the sequence counter and returns the padded result
 */
export const incrementSequenceId = async (
  modelName: string,
  options: SequenceOptions = {}
): Promise<string> => {
  const counter = await Counter.findByIdAndUpdate(
    modelName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return formatSequenceId(counter!.seq, options);
};
