import SiteVisit from "@models/SiteVisit.model";
import { ISiteVisit } from "@interfaces/siteVisit.interface";
import AppError from "@utils/appError";
import { ObjectId } from "mongoose";
interface CreateSiteVisitInput {
  projectId: string;
  clientRepresentative: string;
  contactMethod: ISiteVisit["contactMethod"];
  siteVisitAt: Date;
  commuteTimeMinutes: number;
  notes?: string;
  addedBy: string;
}

export const createSiteVisit = async (input: CreateSiteVisitInput) => {
  const siteVisit = await SiteVisit.create(input);
  return siteVisit;
};

export const acceptSiteVisit = async (siteVisitId: string, adminId: string) => {
  const siteVisit = await SiteVisit.findOne({
    _id: siteVisitId,
    deletedAt: null,
  });

  if (!siteVisit) throw new AppError("Site visit not found", 404);
  if (siteVisit.status === "done")
    throw new AppError("Site visit already accepted", 400);

  siteVisit.status = "done";
  siteVisit.acceptedBy = adminId;
  siteVisit.acceptedAt = new Date();

  await siteVisit.save();

  return siteVisit;
};
