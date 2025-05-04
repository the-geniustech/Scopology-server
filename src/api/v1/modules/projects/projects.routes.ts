// src/routes/project.routes.ts
import express from "express";
import * as projectControllers from "./projects.controller";
import { protect } from "@middlewares/auth.middleware";

const router = express.Router();

router.use(protect);

// Standard CRUD
router
  .route("/")
  .post(projectControllers.createProject)
  .get(projectControllers.getAllProjects);
router
  .route("/:id")
  .get(projectControllers.getProject)
  .patch(projectControllers.updateProject)
  .delete(projectControllers.deleteProject);

// Soft delete (archive) and undo (restore)
router.patch("/:id/archive", projectControllers.archiveProject);
router.patch("/:id/restore", projectControllers.restoreProject);

export default router;
