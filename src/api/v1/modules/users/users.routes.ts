import { Router } from "express";
import * as UserController from "./users.controller";
import { validateUserCreate, validateUserUpdate } from "./users.validator";
import { protect, restrictedTo } from "@middlewares/auth.middleware";

const router = Router();

// 🧪 Optional: Public route for previewing the next available sequential userId
router.get("/preview/next-id", UserController.previewNextUserId);

// 🔐 All routes below require authentication
router.use(protect);

// 🔐 Only administrators can manage users
router
  .route("/")
  .get(restrictedTo("administrator"), UserController.getAllUsers)
  .post(
    restrictedTo("administrator"),
    validateUserCreate,
    UserController.registerUser
  );

// 🧠 Specific fetch operations (can be shared across roles)
router.get(
  "/email/:email",
  restrictedTo("administrator", "supervisor"),
  UserController.getUserByEmail
);

router.get(
  "/:userId(\\d+)",
  restrictedTo("administrator", "supervisor"),
  UserController.getUserByUserId
);

// 🛠️ Update and delete require administrator permissions
router.patch(
  "/:id",
  restrictedTo("administrator"),
  validateUserUpdate,
  UserController.updateUser
);

router.delete("/:id", restrictedTo("administrator"), UserController.deleteUser);

export default router;
