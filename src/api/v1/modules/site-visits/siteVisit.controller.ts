import { Request, Response } from "express";
import { catchAsync } from "@utils/catchAsync";
import { sendSuccess } from "@utils/responseHandler";
import * as siteVisitServices from "./siteVisit.service";
import SiteVisit from "@models/SiteVisit.model";
import AppError from "@utils/appError";
import {
  sendSiteVisitAcceptedEmail,
  SiteVisitAcceptedEmailOptions,
} from "@services/mail/templates/sendSiteVisitAcceptedEmail";
import { findSuperAdmin } from "@modules/auth/auth.service";
import { sendSiteVisitRequestEmail } from "@services/mail/templates/sendSiteVisitRequestEmail";
import { contactMethodMap } from "@constants/siteVisit";

export const createSiteVisitController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const siteVisit = await siteVisitServices.createSiteVisit({
      ...req.body,
      addedBy: userId,
    });

    // Load additional context (project + client)
    const project = await Project.findById(siteVisit.projectId).populate(
      "client"
    );
    const clientName = project?.client?.name || "Unknown Client";
    const projectTitle = project?.name || "Untitled Project";

    // 📅 Format siteVisitAt
    const visitDateObj = new Date(siteVisit.siteVisitAt);
    const siteVisitDate = visitDateObj.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const siteVisitTime = visitDateObj.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

    const readableContactMethod =
      contactMethodMap[siteVisit.contactMethod] || siteVisit.contactMethod;

    // 📩 Notify all administrators
    const admin = await findSuperAdmin();

    sendSiteVisitRequestEmail({
      fullName: admin.fullName,
      clientName,
      projectTitle,
      clientRepresentative: siteVisit.clientRepresentative,
      contactMethod: readableContactMethod,
      siteVisitDate,
      siteVisitTime,
      adminEmail: admin.email,
      dashboardUrl: `${process.env.ADMIN_DASHBOARD_URL}/site-visits`,
      year: new Date().getFullYear(),
    });

    sendSuccess({
      res,
      statusCode: 201,
      message: "Site visit created and email notifications sent to admins",
      data: siteVisit,
    });
  }
);

export const acceptSiteVisitController = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.user?.id;
    const adminName = req.user?.fullName || "Admin";
    const { siteVisitId } = req.params;

    const siteVisit = await SiteVisit.findOne({
      _id: siteVisitId,
      deletedAt: null,
    })
      .populate({
        path: "addedBy",
        select: "fullName email",
        model: "User",
      })
      .populate({
        path: "projectId",
        select: "name",
        model: "Project",
      });

    if (!siteVisit) throw new AppError("Site visit not found", 404);
    if (siteVisit.status === "done")
      throw new AppError("Already accepted", 400);

    siteVisit.status = "done";
    siteVisit.acceptedBy = adminId;
    siteVisit.acceptedAt = new Date();
    await siteVisit.save();

    const visitDateObj = new Date(siteVisit.siteVisitAt);
    const siteVisitDate = visitDateObj.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const siteVisitTime = visitDateObj.toLocaleTimeString(undefined, {
      hour: "numeric",
    });

    if (
      !siteVisit.addedBy ||
      typeof siteVisit.addedBy !== "object" ||
      !("fullName" in siteVisit.addedBy) ||
      !("email" in siteVisit.addedBy)
    ) {
      throw new AppError("Invalid requestor data in scope", 500);
    }
    const requestor = siteVisit.addedBy;

    const projectTitle =
      (siteVisit.projectId as any)?.name || "Unnamed Project";

    if (requestor.email) {
      await sendSiteVisitAcceptedEmail({
        requestorEmail: requestor.email,
        requestorName: requestor.fullName,
        projectTitle,
        siteVisitDate,
        siteVisitTime,
        adminName,
        year: new Date().getFullYear(),
      } as SiteVisitAcceptedEmailOptions);
    }

    sendSuccess({
      res,
      message: "Site visit accepted and requestor notified",
      data: siteVisit,
    });
  }
);
