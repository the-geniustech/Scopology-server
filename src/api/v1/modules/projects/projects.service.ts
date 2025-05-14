import { IProject } from "@interfaces/project.interface";
import { Types } from "mongoose";
import AppError from "@utils/appError";
import Project from "@models/Project.model";
import { findSuperAdmin } from "@modules/auth/auth.service";
import { sendProjectCreationEmail } from "@services/mail/templates/sendProjectCreationEmail";
import { IUserDocument } from "@interfaces/user.interface";
import { incrementSequenceId } from "@utils/sequentialIdGenerator.util";

export const populateProject = async (id: string) => {
  const project = await Project.findOne({ _id: id, deletedAt: null })
    .populate(
      "client",
      "clientName clientLogo clientPhone clientEmail clientType"
    )
    .populate("scope", "-client");
  // .populate("createdBy", "fullName email phoneNumber");

  if (!project) throw new AppError("Project not found", 404);
  return project;
};

export const createProject = async (
  data: Partial<IProject>,
  createdBy: IUserDocument
) => {
  const newProject = await Project.create({
    ...data,
    createdBy: createdBy.id,
  });

  const project = await populateProject(newProject.id);

  if (!project) {
    throw new AppError("Project creation failed", 500);
  }

  const admin = await findSuperAdmin();

  if (!admin) {
    throw new AppError("No admin found to notify", 404);
  }

  sendProjectCreationEmail({
    admin,
    projectName: project.title,
    description: project.category,
    createdBy: { fullName: createdBy.fullName },
    projectId: project.id.toString(),
  });

  return project;
};

export const generateNextProjectId: (
  prefix: string,
  length?: number
) => Promise<string> = async (prefix, length = 4) => {
  return await incrementSequenceId("Project", { prefix, length });
};

export const getProjectById = async (id: string) => {
  const project = await Project.findOne({ _id: id, deletedAt: null })
    .populate("client", "clientName clientLogo")
    .populate("createdBy", "fullName email role");

  if (!project) throw new AppError("Project not found", 404);
  return project;
};

export const getProjectStats = async () => {
  const result = await Project.aggregate([
    { $match: { deletedAt: null } },
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

export const searchProjects = async (keyword: string) => {
  const regex = new RegExp(keyword, "i");
  return await Project.find({
    deletedAt: null,
    $or: [
      { title: regex },
      { description: regex },
      { "client.clientName": regex },
    ],
  })
    .populate("client", "clientName")
    .select("title description client createdAt status");
};

export const softDeleteProject = async (projectId: string, userId: string) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError("Project not found", 404);

  if (project.isArchived) throw new AppError("Project already archived", 400);

  project.deletedAt = new Date();
  project.deletedBy = new Types.ObjectId(userId);
  project.isArchived = true;

  await project.save();
  return project;
};

export const restoreProject = async (projectId: string) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError("Project not found", 404);

  if (!project.isArchived) throw new AppError("Project is not archived", 400);

  project.deletedAt = null;
  project.deletedBy = null;
  project.isArchived = false;

  await project.save();
  return project;
};
