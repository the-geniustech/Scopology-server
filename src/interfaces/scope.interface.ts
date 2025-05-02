import { ObjectId, Document } from "mongoose";

export type ScopeStatus = "pending" | "approved" | "rejected";
export type ScopeSource = "manual" | "client_upload" | "AI";

export interface IScope {
  scopeId: string;
  client?: ObjectId;
  entryRequirements: string[];
  natureOfWork: string;
  isUploadedScopes?: boolean;
  uploadedScopes: Object[];
  projectTitle: string;
  projectDescription: string;
  status: ScopeStatus;
  source: ScopeSource;
  addedBy: ObjectId;
  deletedAt?: Date | null;
}

export interface IScopeDocument extends IScope, Document {}

export interface ResendScopeInviteOptions {
  admin: {
    fullName: string;
    email: string;
  };
  projectTitle: string;
  scopeTitle: string;
  acceptLink: string;
}

export interface ScopeInviteOptions {
  admin: {
    fullName: string;
    email: string;
  };
  projectTitle: string;
  scopeTitle: string;
  acceptLink: string;
}
