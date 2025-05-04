import { Request, Response } from "express";
import * as projectService from "./projects.service";
import { catchAsync } from "@utils/catchAsync";
import { validateData } from "@middlewares/validate.middleware";
import { createProjectSchema } from "./projects.validator";
import { sendSuccess } from "@utils/responseHandler";
import { IProject } from "@interfaces/project.interface";

/**
 * POST /api/v1/projects
 * Create a new project
 */
export const createProject = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as any;

    const payload = validateData(createProjectSchema, {
      ...req.body,
      createdBy: user.id,
    });

    const project = await projectService.createProject(
      payload as Partial<IProject>
    );

    return sendSuccess({
      res,
      statusCode: 201,
      message: "Project created successfully",
      data: { project },
    });
  }
);

/**
 * GET /api/v1/projects/:id
 * Get a single project by ID
 */
export const getProject = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const project = await projectService.getProjectById(id);

    return sendSuccess({
      res,
      message: "Project fetched successfully",
      data: { project },
    });
  }
);

/**
 * DELETE /api/v1/projects/:id
 * Soft delete a project
 */
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
