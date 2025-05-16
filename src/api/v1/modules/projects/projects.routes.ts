// src/routes/project.routes.ts
import express from "express";
import * as projectControllers from "./projects.controller";
import { protect } from "@middlewares/auth.middleware";

const router = express.Router();

router.use(protect);

router
  .route("/")
  // .post(projectControllers.createProject)
  .get(projectControllers.getAllProjects);

router.get("/search", projectControllers.searchProjects);

router.route("/:id").get(projectControllers.getProject);
// .patch(projectControllers.updateProject)
// .delete(projectControllers.deleteProject);

router.patch("/:id/archive", projectControllers.archiveProject);
router.patch("/:id/restore", projectControllers.unarchiveProject);

export default router;
