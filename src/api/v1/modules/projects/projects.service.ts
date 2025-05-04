import { IProject } from "@interfaces/project.interface";
import { Types } from "mongoose";
import AppError from "@utils/appError";
import Project from "@models/Project.model";

export const createProject = async (data: Partial<IProject>) => {
  const existing = await Project.findOne({
    title: data.title,
    client: data.client,
    deletedAt: null,
  });

  if (existing) {
    throw new AppError(
      "A project with the same title already exists for this client.",
      409
    );
  }

  const newProject = new Project({
    ...data,
    _id: new Types.ObjectId(),
  });

  return await newProject.save();
};

export const getProjectById = async (id: string) => {
  const project = await Project.findOne({ _id: id, deletedAt: null })
    .populate("client", "clientName clientBusinessName clientLogo")
    .populate("createdBy", "fullName email role");

  if (!project) throw new AppError("Project not found", 404);
  return project;
};

export const softDeleteProject = async (id: string, deletedBy: string) => {
  const project = await Project.findById(id);
  if (!project) throw new AppError("Project not found", 404);

  project.deletedAt = new Date();
  project.deletedBy = deletedBy;
  return await project.save();
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
