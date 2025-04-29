import { Router } from "express";
import * as ScopeController from "./scope.controller";
import { protect } from "@middlewares/auth.middleware";
import { validateCreateScope, validateUpdateScope } from "./scope.validator";
import { uploadFields } from "@middlewares/fileUpload.middleware";
import { parseFormData } from "@middlewares/parseFormData.middleware";

const router = Router();

router.use(protect);

router
  .route("/")
  .post(
    uploadFields([
      { name: "clientLogo", maxCount: 1 },
      { name: "uploadedScopes", maxCount: 5 },
    ]),
    parseFormData,
    ScopeController.createScope
  )
  .get(ScopeController.listScopes);

router
  .route("/:id")
  .get(ScopeController.getScope)
  .patch(validateUpdateScope, ScopeController.updateScope)
  .delete(ScopeController.deleteScope);

router.route("/:scopeId/resend-invite").post(ScopeController.resendScopeInvite);
router
  .route("/:scopeId/accept-invite")
  .patch(ScopeController.acceptScopeInvite);

router
  .route("/:scopeId/reject-invite")
  .patch(ScopeController.rejectScopeInvite);

export default router;
