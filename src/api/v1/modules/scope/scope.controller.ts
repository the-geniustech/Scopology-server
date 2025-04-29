import { Request, Response } from "express";
import * as ScopeService from "./scope.service";
import * as ClientService from "../clients/clients.service";
import { catchAsync } from "@utils/catchAsync";
import AppError from "@utils/appError";
import { sendSuccess } from "@utils/responseHandler";
import { validateData } from "@middlewares/validate.middleware";
import { createClientSchema } from "../clients/clients.validator";
import { IClient } from "@interfaces/client.interface";
import {
  resendScopeInviteEmail,
  sendScopeInviteEmail,
} from "@services/mail/templates/sendScopeInviteEmail";
import { findSuperAdmin } from "../auth/auth.service";
import { ScopeStatus } from "@constants/scope";
import { createScopeSchema } from "./scope.validator";
import { IUserDocument } from "@interfaces/user.interface";
import {
  getNextSequenceIdPreview,
  incrementSequenceId,
} from "@utils/sequentialIdGenerator.util";
import { idFormatConfig } from "@constants/idPrefixes";

export const createScope = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as IUserDocument;
  const sequenceOptions = idFormatConfig["Scope"];
  const nextUserId = await getNextSequenceIdPreview("Scope", sequenceOptions);

  const clientData = validateData(createClientSchema, req.body);
  if (!clientData) {
    throw new AppError("Client information is required to create a scope", 400);
  }

  const client = await ClientService.createClient(clientData as IClient);

  req.body.client = client.id;
  req.body.addedBy = id;

  req.body = validateData(createScopeSchema, req.body);
  // if (!scopeData) {
  //   throw new AppError("Scope data is required", 400);
  // }

  const scope = await ScopeService.createScope(req.body);

  if (!scope) {
    throw new AppError("Scope could not be created", 500);
  }

  await incrementSequenceId("Scope", sequenceOptions);

  const { fullName, email } = await findSuperAdmin();

  await sendScopeInviteEmail({
    admin: {
      fullName,
      email,
    },
    projectTitle: req.body.projectTitle,
    scopeTitle: req.body.natureOfWork,
    acceptLink: `${process.env.CLIENT_APP_URL}/accept-scope?scopeId=${scope._id}`,
  });

  return sendSuccess({
    res,
    statusCode: 201,
    message: "Scope created successfully and invite sent",
    data: { scope },
  });
});

export const resendScopeInvite = catchAsync(
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

    await resendScopeInviteEmail({
      admin: {
        fullName,
        email,
      },
      projectTitle: scope.projectTitle,
      scopeTitle: scope.natureOfWork,
      acceptLink: `${process.env.CLIENT_APP_URL}/accept-scope?scopeId=${scope._id}`,
    });

    return sendSuccess({
      res,
      message: "Scope invite resent successfully",
      data: {
        scopeId: scope._id,
        projectTitle: scope.projectTitle,
        scopeTitle: scope.natureOfWork,
      },
    });
  }
);

export const acceptScopeInvite = catchAsync(
  async (req: Request, res: Response) => {
    const { scopeId } = req.params;

    const scope = await ScopeService.getScopeById(scopeId);

    if (!scope || scope.deletedAt) {
      throw new AppError("Scope not found or has been deleted", 404);
    }

    if (scope.status === ScopeStatus.APPROVED) {
      throw new AppError("Scope has already been approved", 400);
    }

    scope.status = ScopeStatus.APPROVED;
    await scope.save();

    return sendSuccess({
      res,
      message: "Scope invite accepted successfully",
      data: scope,
    });
  }
);

export const rejectScopeInvite = catchAsync(
  async (req: Request, res: Response) => {
    const { scopeId } = req.params;

    const scope = await ScopeService.getScopeById(scopeId);

    if (!scope || scope.deletedAt) {
      throw new AppError("Scope not found or has been deleted", 404);
    }

    if (scope.status === ScopeStatus.REJECTED) {
      throw new AppError("Scope has already been rejected", 400);
    }

    scope.status = ScopeStatus.REJECTED;
    await scope.save();

    return sendSuccess({
      res,
      message: "Scope invite rejected successfully",
      data: scope,
    });
  }
);

export const getScope = catchAsync(async (req: Request, res: Response) => {
  const scope = await ScopeService.getScopeById(req.params.id);

  if (!scope || scope.deletedAt) {
    throw new AppError("Scope not found", 404);
  }

  return sendSuccess({
    res,
    message: "Scope fetched successfully",
    data: scope,
  });
});

export const listScopes = catchAsync(async (_req: Request, res: Response) => {
  const scopes = await ScopeService.listScopes();

  return sendSuccess({
    res,
    message: "List of scopes",
    results: scopes.length,
    data: scopes,
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
    data: updatedScope,
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
