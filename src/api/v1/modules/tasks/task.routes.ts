import { Router } from "express";
import * as TaskController from "./task.controller";
import { validateCreateTask, validateUpdateTask } from "./task.validator";
import { protect } from "@middlewares/auth.middleware";

const router = Router();

router.post("/", protect, validateCreateTask, TaskController.createTask);
router.get("/gantt/:projectId", protect, TaskController.getTasksByProjectId);

router.patch("/gantt/update", protect, TaskController.updateTask);

router.get("/project/:projectId", protect, TaskController.getTasksByProjectId);

router.patch("/:taskId/mark-as-done", protect, TaskController.markTaskAsDone);
router.post("/:taskId/duplicate", protect, TaskController.duplicateTask);

router.patch("/:taskId/archive", protect, TaskController.archiveTask);
router.patch("/:taskId/restore", protect, TaskController.restoreTask);

router
  .route("/:taskId")
  .delete(protect, TaskController.deleteTask)
  .patch(protect, validateUpdateTask, TaskController.updateTask);

export default router;
