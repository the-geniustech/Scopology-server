import { Router } from "express";
import * as UserController from "./users.controller";
import {
  validateUserPasswordUpdate,
  validateUserProfileUpdate,
} from "./users.validator";
import { protect, restrictedTo } from "@middlewares/auth.middleware";
import { UserRole } from "@constants/roles";
import { uploadSingle } from "@middlewares/fileUpload.middleware";
import User from "@models/User.model";
import { uploadToCloudinary } from "@middlewares/uploadToCloudinary.middleware";

const router = Router();

router.use(protect);

router.route("/").get(UserController.getAllUsers);

router.get("/preview/next-id", UserController.previewNextUserId);

router.get("/stats", UserController.getUserStatsController);

router.patch(
  "/update-profile",
  uploadSingle("avatar"),
  uploadToCloudinary({
    fieldName: "avatar",
    baseFolder: "users",
    subFolder: "avatars",
    deleteExisting: true,
    collectionName: "user",
    model: User,
  }),
  validateUserProfileUpdate,
  UserController.updateProfile
);
router.patch(
  "/update-password",
  validateUserPasswordUpdate,
  UserController.updatePassword
);

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

router
  .route("/:id")
  .patch(
    restrictedTo(UserRole.ADMINISTRATOR),
    validateUserProfileUpdate,
    UserController.updateUser
  )
  .delete(restrictedTo(UserRole.ADMINISTRATOR), UserController.deleteUser);

export default router;
