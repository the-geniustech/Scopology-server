import { Document, Types } from "mongoose";

export interface IProject {
  projectId: string;
  title: string;
  description: string;
  client: Types.ObjectId;
  createdBy: Types.ObjectId;
  status?: "active" | "completed" | "paused" | "cancelled";
  startDate: Date;
  endDate?: Date;
  scopes?: Types.ObjectId[];
  deletedBy: Types.ObjectId | string | null;
  deletedAt?: Date | null;
}

export interface IProjectDocument extends IProject, Document {}
