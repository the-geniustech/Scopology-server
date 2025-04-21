import { Router } from "express";
import * as UserController from "./users.controller";
import { validateUserCreate, validateUserUpdate } from "./users.validator";
import { protect, restrictedTo } from "@middlewares/auth.middleware";
import { UserRole } from "@constants/roles";

const router = Router();

// 🧪 Optional: Public route for previewing the next available sequential userId
router.get("/preview/next-id", UserController.previewNextUserId);

// 🔐 All routes below require authentication
router.use(protect);

// 🔐 Only administrators can manage users
router
  .route("/")
  .get(restrictedTo(UserRole.ADMINISTRATOR), UserController.getAllUsers)
  .post(
    restrictedTo(UserRole.ADMINISTRATOR),
    validateUserCreate,
    UserController.inviteUser
  );

router.get(
  "/search",
  protect,
  restrictedTo(UserRole.ADMINISTRATOR, UserRole.SUPERVISOR),
  UserController.searchUsers
);

// 🧠 Specific fetch operations (can be shared across roles)
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

// 🛠️ Update and delete require administrator permissions
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
