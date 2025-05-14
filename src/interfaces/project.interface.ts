import { Document, Types } from "mongoose";

export interface IProject {
  projectId: string;
  title: string;
  description: string;
  client: Types.ObjectId;
  scope: Types.ObjectId;
  quotation: Types.ObjectId;
  createdBy: Types.ObjectId;
  progress: number;
  status?: "active" | "completed" | "paused" | "cancelled";
  startDate: Date;
  expectedCompletionDate?: Date;
  siteVisits?: Types.ObjectId[];
  deletedBy: Types.ObjectId | string | null;
  deletedAt?: Date | null;
  isArchived?: boolean;
}

export interface IProjectDocument extends IProject, Document {}
