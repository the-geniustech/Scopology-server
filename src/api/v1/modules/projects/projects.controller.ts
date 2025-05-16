import { Request, Response } from "express";
import * as projectService from "./projects.service";
// import { getScopeById } from "../scope/scope.service";
import { catchAsync } from "@utils/catchAsync";
import { validateData } from "@middlewares/validate.middleware";
import { createProjectSchema } from "./projects.validator";
import { sendSuccess } from "@utils/responseHandler";
import { IProject } from "@interfaces/project.interface";
import { search } from "@utils/search.util";
import { AdvancedAPIFeatures, APIFeatures } from "@utils/apiFeatures.util";
// import Scope from "../../../../models/Scope.model";
import Project from "@models/Project.model";
import AppError from "@utils/appError";
import { getInitials } from "@utils/getInitials.util";
// import ProjectCopy from "@models/Scope.model";
import Scope from "@models/Scopes.model";

console.log("Scope model is working!", Scope);

// export const createProject = catchAsync(async (req: Request, res: Response) => {
//   const user = req.user;
//   if (!user) {
//     throw new AppError("User not found", 404);
//   }

//   const scope = await Scope.findById(req.body.scopeId).populate("client");
//   if (!scope || scope.deletedAt || !scope.client) {
//     throw new AppError("Scope or Client could not be found", 404);
//   }

//   if (
//     !scope.client ||
//     typeof scope.client !== "object" ||
//     !("clientNature" in scope.client) ||
//     !("clientName" in scope.client) ||
//     !("_id" in scope.client)
//   ) {
//     throw new AppError("Invalid client data in scope", 500);
//   }

//   const client = scope.client as {
//     _id: string;
//     clientName: string;
//     clientNature: string;
//   };

//   const projectId = await projectService.generateNextProjectId(
//     getInitials(scope.scopeTitle)
//   );

//   const payload = validateData(createProjectSchema, {
//     ...req.body,
//     projectId,
//     title: scope.scopeTitle,
//     type: client.clientNature,
//     category: scope.natureOfWork,
//     client: client._id.toString(),
//     clientName: client.clientName,
//     scope: scope.id,
//     createdBy: user.id,
//   });

//   const project = await projectService.createProject(
//     payload as Partial<IProject>,
//     user
//   );

//   return sendSuccess({
//     res,
//     statusCode: 201,
//     message: "Project created successfully",
//     data: { project },
//   });
// });

export const getProject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await Project.findById(id).populate(
    "client scope siteVisits"
  );

  if (!project || project.deletedAt) {
    throw new AppError("Project not found", 404);
  }

  return sendSuccess({
    res,
    message: "Project fetched successfully",
    data: { project },
  });
});

export const getProjectStats = catchAsync(
  async (_req: Request, res: Response) => {
    const stats = await projectService.getProjectStats();
    sendSuccess({
      res,
      message: "Project stats retrieved successfully",
      data: { projects: { stats } },
    });
  }
);

export const getAllProjects = catchAsync(
  async (req: Request, res: Response) => {
    const baseUrl = `${req.baseUrl}${req.path}`;
    const query = Project.find({ deletedAt: null })
      .populate({
        path: "client",
        select: "clientName clientPhone clientEmail clientLogo clientNature",
      })
      .populate({
        path: "scope",
        select: "-client",
      })
      .populate({
        path: "siteVisits",
        select: "-projectId",
      });

    const features = new AdvancedAPIFeatures(Project, query, req.query);
    const { data: projects, pagination } = await features.applyAll(baseUrl);

    return res.status(200).json({
      status: "success",
      data: projects,
      pagination,
    });
  }
);

export const searchProjects = catchAsync(
  async (req: Request, res: Response) => {
    const keyword = req.query.q as string;

    const projects = await search({
      model: Project,
      keyword,
      searchFields: [
        "scope.scopeTitle",
        "projectId",
        "type",
        "title",
        "client.clientName",
      ],
      populateFields: ["client", "scope"],
      selectFields:
        "projectId status title type createdAt client.clientName client.clientPhone client.clientEmail client.clientLogo client.clientNature scope.scopeTitle scope.natureOfWork",
    });

    return sendSuccess({
      res,
      message: "Project search results",
      results: projects.length,
      data: { projects },
    });
  }
);

export const archiveProject = catchAsync(async (req, res) => {
  const project = await projectService.softDeleteProject(
    req.params.id,
    req.user?.id || ""
  );
  sendSuccess({
    res,
    message: "Project archived successfully",
    data: { project },
  });
});

export const unarchiveProject = catchAsync(async (req, res) => {
  const project = await projectService.restoreProject(req.params.id);
  sendSuccess({
    res,
    message: "Project restored successfully",
    data: { project },
  });
});

export const deleteProjectController = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user as any;

    await projectService.softDeleteProject(id, user.id);

    return sendSuccess({
      res,
      message: "Project deleted successfully",
    });
  }
);
