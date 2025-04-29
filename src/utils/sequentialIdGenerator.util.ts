import { Counter } from "../models/Counter.model";

interface SequenceOptions {
  prefix?: string;
  length?: number;
}

const padId = (num: number, length: number = 4): string => {
  return String(num).padStart(length, "0");
};

const formatSequenceId = (
  seq: number,
  options: SequenceOptions = {}
): string => {
  const padded = padId(seq, options.length || 4);
  return options.prefix ? `${options.prefix}-${padded}` : padded;
};

export const getNextSequenceIdPreview = async (
  modelName: string,
  options: SequenceOptions = {}
): Promise<string> => {
  let counter = await Counter.findById(modelName);
  if (!counter) {
    counter = await Counter.create({ _id: modelName });
  }
  const next = counter ? counter.seq + 1 : 1;
  return formatSequenceId(next, options);
};

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
