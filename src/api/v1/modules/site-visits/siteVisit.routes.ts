import { Router } from "express";
import * as siteVisitController from "./siteVisit.controller";
import { protect } from "@middlewares/auth.middleware";

const router = Router();

router.use(protect);

router.route("/").post(siteVisitController.createSiteVisitController);
router
  .route("/:siteVisitId/accept")
  .patch(siteVisitController.acceptSiteVisitController);

export default router;
