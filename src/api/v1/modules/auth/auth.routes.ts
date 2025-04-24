import { Router } from "express";
import * as authController from "./auth.controller";
import {
  validateInviteUser,
  validateAcceptInvite,
  validateResendInviteUser,
} from "./auth.validator";
import { UserRole } from "@constants/roles";
import { protect, restrictedTo } from "@middlewares/auth.middleware";
import { resendInvite } from "./auth.service";

const router = Router();

router.post("/login", authController.loginUser);
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

export default router;
