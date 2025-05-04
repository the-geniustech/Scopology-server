import { ObjectId } from "mongoose";

export interface ISiteVisit extends Document {
  projectId: ObjectId;
  clientRepresentative: string;
  contactMethod: "phone" | "email" | "in_person" | "whatsapp" | "other";
  siteVisitAt: Date;
  commuteTimeMinutes: number;
  status: "scheduled" | "done" | "cancelled";
  acceptedBy?: ObjectId | string;
  acceptedAt?: Date;
  notes?: string;
  addedBy: ObjectId;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteVisitRequestEmailOptions {
  fullName: string;
  clientName: string;
  clientRepresentative: string;
  contactMethod: string;
  siteVisitDate: string;
  siteVisitTime: string;
  projectTitle: string;
  adminEmail: string;
  dashboardUrl: string;
  year: number;
}