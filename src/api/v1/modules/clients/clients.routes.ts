import { Router } from "express";
import * as clientController from "./clients.controller";
import { validateCreateClient } from "./clients.validator";
import { protect, restrictedTo } from "@middlewares/auth.middleware";
import { UserRole } from "@constants/roles";
import { uploadSingle } from "@middlewares/fileUpload.middleware";

const router = Router();

router.use(protect);

router
  .route("/")
  .post(
    protect,
    restrictedTo(UserRole.ADMINISTRATOR),
    uploadSingle("logo"),
    validateCreateClient,
    clientController.createClient
  )
  .get(protect, clientController.getClients);

router.get("/search", clientController.searchUsers);

export default router;
