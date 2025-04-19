import { Schema, model } from "mongoose";

interface ICounter {
  _id: string; // model name e.g. "User"
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: {
    type: String,
    required: true,
    unique: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

export const Counter = model<ICounter>("Counter", counterSchema);
