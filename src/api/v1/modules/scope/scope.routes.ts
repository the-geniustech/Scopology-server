import { Router } from "express";
import * as ScopeController from "./scope.controller";
import { protect } from "@middlewares/auth.middleware";
import { validateRejectScope, validateUpdateScope } from "./scope.validator";
import { uploadClientLogoAndUploadedScopes } from "@middlewares/fileUpload.middleware";
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

router.get("/search", ScopeController.searchScopes);
router.get("/stats", ScopeController.getScopeStatsController);

router
  .route("/:id")
  .get(ScopeController.getScope)
  .patch(validateUpdateScope, ScopeController.updateScope)
  .delete(ScopeController.deleteScope);

router
  .route("/:scopeId/resend-request")
  .post(ScopeController.resendScopeApproval);

router.route("/:scopeId/accept").patch(ScopeController.approveScope);

router
  .route("/:scopeId/reject")
  .patch(validateRejectScope, ScopeController.rejectScope);

export default router;
