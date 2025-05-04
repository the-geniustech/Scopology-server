import { Router } from "express";
import * as siteVisitController from "./siteVisit.controller";
import { validateCreateSiteVisit } from "./siteVisit.validator";
import { protect } from "@middlewares/auth.middleware";

const router = Router();

router.use(protect);

router
  .route("/")
  .post(validateCreateSiteVisit, siteVisitController.createSiteVisitController);

export default router;
