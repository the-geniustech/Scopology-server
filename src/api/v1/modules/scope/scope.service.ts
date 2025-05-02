import Scope from "@models/Scope.model";
import { IScope, IScopeDocument } from "@interfaces/scope.interface";
import { incrementSequenceId } from "@utils/sequentialIdGenerator.util";
import {
  uploadMultipleFilesToCloudinary,
  uploadSingleFileToCloudinary,
} from "@services/cloudinaryUpload.service";
import { sendScopeInviteEmail } from "@services/mail/templates/sendScopeInviteEmail";
import { findSuperAdmin } from "@modules/auth/auth.service";

export const createScope = async (data: Partial<IScope>) => {
  const scope = new Scope(data);
  return await scope.save();
};

export const generateNextScopeId = async (
  prefix: string,
  length: number = 4
): Promise<string> => {
  return await incrementSequenceId("Scope", { prefix, length });
};

export const handleScopeUploads = async (files: {
  [fieldname: string]: Express.Multer.File[];
}) => {
  let logoUploadResult = null;
  let uploadedDocuments: any[] = [];

  if (files.clientLogo && files.clientLogo.length > 0) {
    logoUploadResult = await uploadSingleFileToCloudinary(
      files.clientLogo[0].buffer,
      "clients",
      "logos"
    );
  }

  if (files.uploadedScopes && files.uploadedScopes.length > 0) {
    uploadedDocuments = await uploadMultipleFilesToCloudinary(
      files.uploadedScopes,
      "scopes",
      "uploadedScopes"
    );
  }

  return { logoUploadResult, uploadedDocuments };
};

export const notifyAdminOnScopeCreation = async (scope: IScopeDocument) => {
  const { fullName, email } = await findSuperAdmin();

  await sendScopeInviteEmail({
    admin: { fullName, email },
    projectTitle: scope.projectTitle,
    scopeTitle: scope.natureOfWork,
    acceptLink: `${process.env.CLIENT_APP_URL}/accept-scope?scopeId=${scope._id}`,
  });
};

export const getScopeStats = async () => {
  const result = await Scope.aggregate([
    { $match: { deletedAt: null } }, // exclude soft-deleted scopes
    {
      $facet: {
        total: [{ $count: "count" }],
        approved: [{ $match: { status: "approved" } }, { $count: "count" }],
        rejected: [{ $match: { status: "rejected" } }, { $count: "count" }],
        pending: [{ $match: { status: "pending" } }, { $count: "count" }],
      },
    },
    {
      $project: {
        total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
        approved: { $ifNull: [{ $arrayElemAt: ["$approved.count", 0] }, 0] },
        rejected: { $ifNull: [{ $arrayElemAt: ["$rejected.count", 0] }, 0] },
        pending: { $ifNull: [{ $arrayElemAt: ["$pending.count", 0] }, 0] },
      },
    },
  ]);

  return result[0] || { total: 0, approved: 0, rejected: 0, pending: 0 };
};

export const getScopeById = async (id: string) => {
  return await Scope.findById(id).populate(
    "client addedBy",
    "clientBusinessName clientName clientLogo fullName email "
  );
};

export const listScopes = async () => {
  return await Scope.find({ deletedAt: null }).populate(
    "client addedBy",
    "clientBusinessName clientName clientLogo fullName email "
  );
};

export const updateScope = async (id: string, updates: Partial<IScope>) => {
  return await Scope.findByIdAndUpdate(id, updates, { new: true });
};

export const softDeleteScope = async (id: string) => {
  return await Scope.findByIdAndUpdate(
    id,
    { deletedAt: new Date() },
    { new: true }
  );
};
