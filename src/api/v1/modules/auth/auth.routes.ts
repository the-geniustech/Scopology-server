import { Router } from "express";
import * as authController from "./auth.controller";
import {
  validateInviteUser,
  validateAcceptInvite,
  validateResendInviteUser,
  validateRevokeInvite,
  validateSignupSuperAdmin,
  validateLogin,
} from "./auth.validator";
import { UserRole } from "@constants/roles";
import { protect, restrictedTo } from "@middlewares/auth.middleware";

const router = Router();

router.post(
  "/signup-superadmin",
  validateSignupSuperAdmin,
  authController.signupSuperAdmin
);

router.post("/login", validateLogin, authController.login);
router.post("/add-user", authController.registerUser);

router.post(
  "/invite",
  protect,
  restrictedTo(UserRole.ADMINISTRATOR),
  validateInviteUser,
  authController.inviteUser
);

router.post(
  "/resend-invite",
  protect,
  restrictedTo(UserRole.ADMINISTRATOR),
  validateResendInviteUser,
  authController.resendInvite
);

router.post(
  "/accept-invite",
  validateAcceptInvite,
  authController.acceptInvite
);

router.post(
  "/revoke-invite",
  protect,
  restrictedTo(UserRole.ADMINISTRATOR),
  validateRevokeInvite,
  authController.revokeInvite
);

export default router;
