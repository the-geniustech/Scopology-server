import { ObjectId, Document } from "mongoose";

export type ScopeStatus = "pending" | "approved" | "rejected";
export type ScopeSource = "manual" | "client_upload" | "AI";

export interface IScope {
  scopeId: string;
  client: ObjectId;
  scopeTitle: string;
  scopeOverview: string;
  entryRequirements: string[];
  natureOfWork: string;
  isUploadedScopes: boolean;
  uploadedScopes: object[];
  progress: number;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string | null;
  rejectionMessage?: string | null;
  source: "manual" | "client_upload" | "AI";
  addedBy: ObjectId;
  deletedAt?: Date | null;
}

export interface IScopeDocument extends IScope, Document {}

/* export interface IScope {
  client?: ObjectId;
  scopeId: string;
  scopeOverview: string;
  entryRequirements: string[];
  natureOfWork: string;
  isUploadedScopes?: boolean;
  uploadedScopes: Object[];
  scopeTitle: string;
  progress: number;
  status: ScopeStatus;
  source: ScopeSource;
  addedBy: ObjectId;
  deletedAt?: Date | null;
  rejectionReason?: string;
  rejectionMessage?: string;
}

export interface IScopeDocument extends IScope, Document {} */

export interface ResendScopeApprovalOptions {
  admin: {
    fullName: string;
    email: string;
  };
  scopeTitle: string;
  natureOfWork: string;
  acceptLink: string;
}

export interface ScopeApprovalOptions {
  admin: {
    fullName: string;
    email: string;
  };
  natureOfWork: string;
  scopeTitle: string;
  acceptLink: string;
}
