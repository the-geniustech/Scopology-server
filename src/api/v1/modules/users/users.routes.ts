import { Router } from "express";
import * as UserController from "./users.controller";
import { validateUserUpdate } from "./users.validator";
import { protect, restrictedTo } from "@middlewares/auth.middleware";
import { UserRole } from "@constants/roles";

const router = Router();

router.use(protect);

router.get("/preview/next-id", UserController.previewNextUserId);

router.get(
  "/search",
  protect,
  restrictedTo(UserRole.ADMINISTRATOR, UserRole.SUPERVISOR),
  UserController.searchUsers
);

router.get(
  "/email/:email",
  restrictedTo(UserRole.ADMINISTRATOR, UserRole.SUPERVISOR),
  UserController.getUserByEmail
);

router.get(
  "/:userId",
  restrictedTo(UserRole.ADMINISTRATOR, UserRole.SUPERVISOR),
  UserController.getUserByUserId
);

router.patch(
  "/:id",
  restrictedTo(UserRole.ADMINISTRATOR),
  validateUserUpdate,
  UserController.updateUser
);

router.delete(
  "/:id",
  restrictedTo(UserRole.ADMINISTRATOR),
  UserController.deleteUser
);

export default router;
