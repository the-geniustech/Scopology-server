import { Request, Response } from "express";
import * as projectService from "./projects.service";
import { getScopeById } from "../scope/scope.service";
import { catchAsync } from "@utils/catchAsync";
import { validateData } from "@middlewares/validate.middleware";
import { createProjectSchema } from "./projects.validator";
import { sendSuccess } from "@utils/responseHandler";
import { IProject } from "@interfaces/project.interface";
import { search } from "@utils/search.util";
import { AdvancedAPIFeatures, APIFeatures } from "@utils/apiFeatures.util";
import Project from "@models/Project.model";
import AppError from "@utils/appError";
import { getInitials } from "@utils/getInitials.util";

export const createProject = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const scope = await getScopeById(req.body.scopeId);
  if (!scope || scope.deletedAt || !scope.client) {
    throw new AppError("Scope or Client could not be found", 404);
  }

  const projectId = await projectService.generateNextProjectId(
    getInitials(scope.scopeTitle)
  );

  const payload = validateData(createProjectSchema, {
    ...req.body,
    projectId,
    client: scope.client.toString(),
    scope: scope.id,
    createdBy: user.id,
  });

  const project = await projectService.createProject(
    payload as Partial<IProject>,
    user
  );

  return sendSuccess({
    res,
    statusCode: 201,
    message: "Project created successfully",
    data: { project },
  });
});

export const getProject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await projectService.getProjectById(id);

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

// export const getAllProjects = catchAsync(
//   async (req: Request, res: Response) => {
//     const baseUrl = `${req.baseUrl}${req.path}`;
//     const features = new APIFeatures(
//       Project.find({ isArchived: false, deletedAt: null })
//         .populate({
//           path: "client",
//           select:
//             "clientName clientPhone clientEmail clientLogo clientNatureOfBusiness",
//         })
//         .populate({
//           path: "scope",
//           select: "-client",
//         })
//         .populate({
//           path: "siteVisits",
//           select: "-projectId",
//         }),
//       req.query
//     );
//     const { data: projects, pagination } =
//       await features.applyAllFiltersWithPaginationMeta(baseUrl);

//     return res.status(200).json({
//       status: "success",
//       message: "List of projects",
//       pagination,
//       results: projects.length,
//       data: { projects },
//     });
//   }
// );
export const getAllProjects = catchAsync(
  async (req: Request, res: Response) => {
    // const baseUrl = `${req.baseUrl}${req.path}`;

    // const features = new AdvancedAPIFeatures(
    //   Project.find().populate("client scope"),
    //   req.query
    // );
    // const { data: projects, pagination } =
    //   await features.applyAllFiltersWithPaginationMeta(req.originalUrl);

    // const query = Project.find().populate([
    //   { path: "client" },
    //   { path: "scope", select: "-client" },
    // ]);
    // const query = Project.find().populate([
    //   { path: "client", select: "clientName clientNatureOfBusiness" },
    //   { path: "scope", select: "scopeTitle status" },
    // ]);

    // const features = new AdvancedAPIFeatures(query, req.query);
    // const result = await features.applyAllFiltersWithPaginationMeta(
    //   req.baseUrl
    // );

    // return res.status(200).json({
    //   status: "success",
    //   ...result,
    // });

    // const baseUrl = `${req.baseUrl}${req.path}`;
    // const features = new AdvancedAPIFeatures(
    //   Project.find().populate([
    //     { path: "client" },
    //     { path: "scope", select: "-client" },
    //   ]),
    //   req.query
    // );
    // const result = await features.applyAll(baseUrl);

    // return res.status(200).json({
    //   status: "success",
    //   ...result,
    // });

    // return res.status(200).json({
    //   status: "success",
    //   message: "List of projects",
    //   pagination,
    //   results: projects.length,
    //   data: { projects },
    // });

    const baseUrl = `${req.baseUrl}${req.path}`;
    const query = Project.find({ deletedAt: null }).populate([
      { path: "client" },
      { path: "scope", select: "-client" },
    ]); // Always provide your base query
    const features = new AdvancedAPIFeatures(query, req.query);
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
      searchFields: ["scope.scopeTitle", "projectId", "client.clientName"],
      populateFields: ["client", "scope"],
      selectFields:
        "-scope.client projectId status createdAt client.clientName client.clientPhone client.clientEmail client.clientLogo client.clientNatureOfBusiness",
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
