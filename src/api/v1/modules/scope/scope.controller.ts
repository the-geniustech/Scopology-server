import { Request, Response } from "express";
import * as ScopeService from "./scope.service";
import * as ClientService from "../clients/clients.service";
import { catchAsync } from "@utils/catchAsync";
import AppError from "@utils/appError";
import { sendSuccess } from "@utils/responseHandler";
import { validateData } from "@middlewares/validate.middleware";
import { createClientSchema } from "../clients/clients.validator";
import { IClient } from "@interfaces/client.interface";
import { findSuperAdmin } from "../auth/auth.service";
import { ScopeStatus } from "@constants/scope";
import { createScopeSchema } from "./scope.validator";
import { getInitials } from "@utils/getInitials.util";
import { APIFeatures } from "@utils/apiFeatures.util";
import Scope from "@models/Scope.model";
import { IScope } from "@interfaces/scope.interface";
import { sendScopeRejectionEmail } from "@services/mail/templates/sendScopeRejectionEmail";
import {
  ScopeApprovalEmailOptions,
  sendScopeApprovalEmail,
} from "@services/mail/templates/sendScopeApprovalEmail";
import { resendScopeApprovalRequestEmail } from "@services/mail/templates/sendScopeApprovalRequestEmail";
import { search } from "@utils/search.util";

export const createScope = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user || {};

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const { logoUploadResult, uploadedDocuments } =
    await ScopeService.handleScopeUploads(files);

  let client;
  if (req.body.clientId) {
    client = await ClientService.getClientById(req.body.clientId);
    if (!client) throw new AppError("Client not found", 404);
  } else {
    if (logoUploadResult) req.body.clientLogo = logoUploadResult;
    const clientData = validateData(createClientSchema, req.body);
    client = await ClientService.createClient(clientData as Partial<IClient>);
  }

  const scopeId = await ScopeService.generateNextScopeId(
    getInitials(client.clientName)
  );

  const scopePayload = {
    ...req.body,
    scopeId,
    client: client.id,
    addedBy: userId,
    status: ScopeStatus.PENDING,
    uploadedScopes: uploadedDocuments,
  };

  const validatedData = validateData(createScopeSchema, scopePayload);

  const scope = await ScopeService.createScope(
    validatedData as Partial<IScope>
  );
  const populatedScope = await scope.populate(
    "client addedBy",
    "clientName clientLogo clientPhone clientEmail clientNatureOfBusiness fullName email"
  );

  await ScopeService.notifyAdminOnScopeCreation(populatedScope);

  return sendSuccess({
    res,
    statusCode: 201,
    message: "Scope created successfully and invite sent",
    data: { scope: populatedScope },
  });
});

export const resendScopeApproval = catchAsync(
  async (req: Request, res: Response) => {
    const { scopeId } = req.params;

    const scope = await ScopeService.getScopeById(scopeId);

    if (!scope || scope.deletedAt) {
      throw new AppError("Scope not found or has been deleted", 404);
    }

    if (scope.status === ScopeStatus.APPROVED) {
      throw new AppError("Scope invite has already been approved", 400);
    }

    if (scope.status === ScopeStatus.REJECTED) {
      throw new AppError("Scope invite has been rejected", 400);
    }

    const { fullName, email } = await findSuperAdmin();

    await resendScopeApprovalRequestEmail({
      admin: { fullName, email },
      projectTitle: scope.scopeTitle,
      scopeTitle: scope.natureOfWork,
      acceptLink: `${process.env.CLIENT_APP_URL}/accept-scope?scopeId=${scope._id}`,
    });

    return sendSuccess({
      res,
      message: "Scope invite resent successfully",
      data: {
        scope: {
          scopeId: scope._id,
          projectTitle: scope.projectTitle,
          scopeTitle: scope.natureOfWork,
        },
      },
    });
  }
);

export const approveScope = catchAsync(async (req: Request, res: Response) => {
  const { scopeId } = req.params;

  const scope = await Scope.findById(scopeId).populate(
    "client",
    "clientName clientEmail"
  );

  if (!scope || scope.deletedAt) {
    throw new AppError("Scope not found or has been deleted", 404);
  }

  if (scope.status === ScopeStatus.APPROVED) {
    throw new AppError("Scope has already been approved", 400);
  }

  if (scope.status === ScopeStatus.REJECTED) {
    throw new AppError("Rejected scopes cannot be approved", 400);
  }

  scope.status = ScopeStatus.APPROVED;
  scope.rejectionReason = undefined;
  scope.rejectionMessage = undefined;

  await scope.save();

  if (
    !scope.client ||
    typeof scope.client !== "object" ||
    !("clientName" in scope.client) ||
    !("clientEmail" in scope.client)
  ) {
    throw new AppError("Invalid client data in scope", 500);
  }

  const { clientName, clientEmail } = scope.client;

  await sendScopeApprovalEmail({
    clientName,
    clientEmail,
    projectTitle: scope.projectTitle,
    scopeTitle: scope.natureOfWork,
  } as ScopeApprovalEmailOptions);

  return sendSuccess({
    res,
    message: "Scope has been accepted successfully",
    data: {
      scope: {
        scopeId: scope._id,
        status: scope.status,
        projectTitle: scope.projectTitle,
        natureOfWork: scope.natureOfWork,
        clientName,
      },
    },
  });
});

export const rejectScope = catchAsync(async (req: Request, res: Response) => {
  const { scopeId } = req.params;
  const { reason, message } = req.body;

  const scope = await Scope.findById(scopeId).populate(
    "client",
    "clientName clientEmail"
  );
  if (!scope || scope.deletedAt) {
    throw new AppError("Scope not found or has been deleted", 404);
  }

  if (scope.status === ScopeStatus.REJECTED) {
    throw new AppError("Scope has already been rejected", 400);
  }

  scope.status = ScopeStatus.REJECTED;
  scope.rejectionReason = reason;
  scope.rejectionMessage = message;

  await scope.save();

  if (
    !scope.client ||
    typeof scope.client !== "object" ||
    !("clientName" in scope.client) ||
    !("clientEmail" in scope.client)
  ) {
    throw new AppError("Invalid client data in scope", 500);
  }
  const { clientName, clientEmail } = scope.client as {
    clientName: string;
    clientEmail: string;
  };

  await sendScopeRejectionEmail({
    clientEmail,
    clientName,
    projectTitle: scope.projectTitle,
    scopeTitle: scope.natureOfWork,
    rejectionReason: scope.rejectionReason!,
    rejectionMessage: scope.rejectionMessage,
  });

  return sendSuccess({
    res,
    message: "Scope has been rejected successfully",
    data: {
      scope: { scopeId: scope.scopeId, reason, message },
    },
  });
});

export const getScopeStatsController = catchAsync(
  async (_req: Request, res: Response) => {
    const stats = await ScopeService.getScopeStats();
    sendSuccess({
      res,
      message: "Scope stats retrieved successfully",
      data: { scopes: { stats } },
    });
  }
);

export const getScope = catchAsync(async (req: Request, res: Response) => {
  const scope = await ScopeService.getScopeById(req.params.id);

  if (!scope || scope.deletedAt) {
    throw new AppError("Scope not found", 404);
  }

  const populatedScope = await scope.populate(
    "client addedBy",
    "clientName clientLogo fullName email"
  );

  return sendSuccess({
    res,
    message: "Scope fetched successfully",
    data: { scope: populatedScope },
  });
});

export const listScopes = catchAsync(async (req: Request, res: Response) => {
  const baseUrl = `${req.baseUrl}${req.path}`;
  const features = new APIFeatures(
    Scope.find({ deletedAt: null }).populate(
      "client addedBy",
      "clientName clientLogo clientPhone clientEmail clientNatureOfBusiness fullName email"
    ),
    req.query
  );
  const { data: scopes, pagination } =
    await features.applyAllFiltersWithPaginationMeta(baseUrl);

  return res.status(200).json({
    status: "success",
    message: "List of scopes",
    pagination,
    results: scopes.length,
    data: { scopes },
  });
});

export const searchScopes = catchAsync(async (req: Request, res: Response) => {
  const keyword = req.query.q as string;

  const scopes = await search({
    model: Scope,
    keyword,
    searchFields: ["scopeTitle", "scopeId", "client.clientName"],
    populateFields: ["client"],
    selectFields:
      "scopeTitle scopeId status createdAt client.clientName client.clientName client.clientLogo client.clientPhone client.clientEmail",
  });

  return sendSuccess({
    res,
    message: "Scope search results",
    results: scopes.length,
    data: { scopes },
  });
});

export const updateScope = catchAsync(async (req: Request, res: Response) => {
  const updatedScope = await ScopeService.updateScope(req.params.id, req.body);

  if (!updatedScope) {
    throw new AppError("Scope not found or could not be updated", 404);
  }

  return sendSuccess({
    res,
    message: "Scope updated successfully",
    data: { scope: updatedScope },
  });
});

export const deleteScope = catchAsync(async (req: Request, res: Response) => {
  const deletedScope = await ScopeService.softDeleteScope(req.params.id);

  if (!deletedScope) {
    throw new AppError("Scope not found or already deleted", 404);
  }

  return sendSuccess({
    res,
    message: "Scope deleted successfully",
    data: deletedScope,
  });
});
