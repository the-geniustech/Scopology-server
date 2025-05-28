import { Router } from "express";
import { protect } from "@middlewares/auth.middleware";
import {
  validateToolboxForm,
  validateUpdateToolboxForm,
} from "./toolbox.validator";
import * as toolboxController from "./toolbox.controller";
import { parseToolboxFormData } from "@middlewares/parseToolboxFormData";

const router = Router();

router.use(protect);

router.post(
  "/",
  parseToolboxFormData,
  validateToolboxForm,
  toolboxController.createToolboxMeetingForm
);

router.patch(
  "/:id",
  parseToolboxFormData,
  validateUpdateToolboxForm,
  toolboxController.updateToolboxMeetingForm
);

router.get("/:id/download", toolboxController.downloadToolboxPDF);

export default router;
