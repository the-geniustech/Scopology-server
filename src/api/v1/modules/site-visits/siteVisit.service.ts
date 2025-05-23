import SiteVisit from "@models/SiteVisit.model";
import AppError from "@utils/appError";
import { CreateSiteVisitInput } from "./siteVisit.validator";

export const createSiteVisit = async (input: CreateSiteVisitInput) => {
  const siteVisit = await SiteVisit.create(input);

  if (!siteVisit) {
    throw new AppError("siteVisit creation failed, please again later!", 400);
  }
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

  await siteVisit.save({ validateModifiedOnly: true });

  return siteVisit;
};
