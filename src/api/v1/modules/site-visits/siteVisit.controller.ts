import { Request, Response } from "express";
import { catchAsync } from "@utils/catchAsync";
import { sendSuccess } from "@utils/responseHandler";
import * as siteVisitServices from "./siteVisit.service";
import * as userServices from "../users/users.service";
import SiteVisit from "@models/SiteVisit.model";
import AppError from "@utils/appError";
import {
  sendSiteVisitAcceptedEmail,
  SiteVisitAcceptedEmailOptions,
} from "@services/mail/templates/sendSiteVisitAcceptedEmail";
import { findSuperAdmin } from "@modules/auth/auth.service";
import { sendSiteVisitRequestEmail } from "@services/mail/templates/sendSiteVisitRequestEmail";
import { contactMethodMap } from "@constants/siteVisit";
import Project from "@models/Project.model";
import { validateData } from "@middlewares/validate.middleware";
import {
  CreateSiteVisitInput,
  createSiteVisitSchema,
} from "./siteVisit.validator";
import { parseTimeString } from "@utils/helpers.util";

export const createSiteVisitController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const clientRepresentative = await userServices.getUserByObjectId(
      req.body.clientRepresentativeId
    );
    if (!clientRepresentative)
      throw new AppError("clientRepresentative not found", 404);

    const project = await Project.findById(req.body.projectId).populate(
      "client"
    );

    if (!project || project.deletedAt) {
      throw new AppError("Project not found", 404);
    }

    if (
      !project.client ||
      typeof project.client !== "object" ||
      !("clientName" in project.client) ||
      !("clientEmail" in project.client)
    ) {
      throw new AppError("Invalid client data in project", 500);
    }

    const { hours, minutes } = parseTimeString(req.body.siteVisitTime);

    req.body.siteVisitDate = new Date(req.body.siteVisitDate);
    req.body.siteVisitDate.setUTCHours(hours, minutes, 0, 0);
    req.body.siteVisitDate = req.body.siteVisitDate.toISOString();

    const payload = validateData(createSiteVisitSchema, {
      ...req.body,
      clientRepresentative: clientRepresentative.id,
      projectId: project.id,
      addedBy: userId,
    });

    const siteVisit = await siteVisitServices.createSiteVisit(
      payload as CreateSiteVisitInput
    );

    const visitDateObj = new Date(siteVisit.siteVisitDate);
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

    const admin = await findSuperAdmin();

    sendSiteVisitRequestEmail({
      fullName: admin.fullName,
      clientName: project.client.clientName as string,
      projectTitle: project.title,
      clientRepresentativeName: clientRepresentative.fullName,
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
      data: { siteVisit },
    });
  }
);

export const acceptSiteVisitController = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.user?.id;
    const adminName = req.user?.fullName || "Admin";
    const { siteVisitId } = req.params;

    const siteVisit = await SiteVisit.findById(siteVisitId).populate({
      path: "clientRepresentative",
      select: "fullName email",
    });
    if (!siteVisit) throw new AppError("Site visit not found", 404);
    if (siteVisit.status === "done")
      throw new AppError("Already accepted", 400);

    const project = await Project.findById(siteVisit.projectId).populate({
      path: "scope",
      select: "title",
    });

    if (!project || project.deletedAt) {
      throw new AppError("Project not found", 404);
    }

    if (
      !project.scope ||
      typeof project.scope !== "object" ||
      !("scopeTitle" in project.scope)
    ) {
      throw new AppError("Invalid client data in project", 500);
    }

    siteVisit.status = "scheduled";
    siteVisit.acceptedBy = adminId;
    siteVisit.acceptedAt = new Date();
    await siteVisit.save({ validateModifiedOnly: true });

    project.siteVisits?.push(siteVisit.id);
    await project.save({ validateModifiedOnly: true });

    if (
      !siteVisit.clientRepresentative ||
      typeof siteVisit.clientRepresentative !== "object" ||
      !("fullName" in siteVisit.clientRepresentative) ||
      !("email" in siteVisit.clientRepresentative)
    ) {
      throw new AppError("Invalid requestor data in scope", 500);
    }
    const requestor = siteVisit.clientRepresentative;

    if (requestor.email) {
      await sendSiteVisitAcceptedEmail({
        requestorEmail: requestor.email,
        requestorName: requestor.fullName,
        projectTitle: project.scope.scopeTitle,
        siteVisitDate: siteVisit.siteVisitDate,
        siteVisitTime: siteVisit.siteVisitTime,
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
