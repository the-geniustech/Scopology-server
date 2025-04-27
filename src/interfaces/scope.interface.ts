import { Document, Types } from "mongoose";

export type ScopeStatus = "pending" | "approved" | "rejected" | "in-review";
export type ScopeSource = "manual" | "client_upload" | "site_visit" | "AI";

export interface IScope {
  scopeId: string; // e.g. SCP-0001
  version: number;
  title: string;
  description?: string;
  documents?: string[]; // URLs or Cloudinary IDs
  status: ScopeStatus;
  createdFrom: ScopeSource;
  addedBy: Types.ObjectId;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IScopeDocument extends IScope, Document {}
