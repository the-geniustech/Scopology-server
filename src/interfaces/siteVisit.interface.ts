import { ObjectId } from "mongoose";

export interface ISiteVisit extends Document {
  projectId: ObjectId;
  clientRepresentative: ObjectId;
  contactMethod: string;
  siteVisitDate: Date;
  siteVisitTime: string; // HH:mm format
  commuteTime: string;
  status: "pending" | "scheduled" | "done" | "cancelled";
  acceptedBy?: ObjectId | string;
  acceptedAt?: Date;
  addedBy: ObjectId;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteVisitRequestEmailOptions {
  fullName: string;
  clientName: string;
  clientRepresentativeName: string;
  contactMethod: string;
  siteVisitDate: string;
  siteVisitTime: string;
  projectTitle?: string;
  adminEmail: string;
  dashboardUrl: string;
  year: number;
}
