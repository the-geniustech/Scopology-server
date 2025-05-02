import { Router } from "express";
import * as ScopeController from "./scope.controller";
import { protect } from "@middlewares/auth.middleware";
import { validateUpdateScope } from "./scope.validator";
import {
  uploadFields,
  uploadClientLogoAndUploadedScopes,
} from "@middlewares/fileUpload.middleware";
import { parseFormData } from "@middlewares/parseFormData.middleware";

const router = Router();

router.use(protect);

router
  .route("/")
  .post(
    uploadClientLogoAndUploadedScopes,
    parseFormData,
    ScopeController.createScope
  )
  .get(ScopeController.listScopes);

router.get("/stats", ScopeController.getScopeStatsController);

router
  .route("/:id")
  .get(ScopeController.getScope)
  .patch(validateUpdateScope, ScopeController.updateScope)
  .delete(ScopeController.deleteScope);

router
  .route("/:scopeId/resend-request")
  .post(ScopeController.resendScopeInvite);

router.route("/:scopeId/accept").patch(ScopeController.acceptScopeInvite);

router.route("/:scopeId/reject").patch(ScopeController.rejectScopeInvite);

export default router;
