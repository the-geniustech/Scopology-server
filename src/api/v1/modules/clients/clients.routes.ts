import { Router } from "express";
import * as clientController from "./clients.controller";
import { validate } from "@middlewares/validate.middleware";
import { createClientSchema, validateUpdateClient } from "./clients.validator";
import { protect, restrictedTo } from "@middlewares/auth.middleware";
import { UserRole } from "@constants/roles";

const router = Router();

router
  .route("/")
  .post(
    protect,
    restrictedTo(UserRole.ADMINISTRATOR),
    validateUpdateClient,
    clientController.createClient
  )
  .get(protect, clientController.getClients);

router
  .route("/:id")
  .get(protect, clientController.getClient)
  .patch(
    protect,
    restrictedTo(UserRole.ADMINISTRATOR),
    validateUpdateClient,
    clientController.updateClient
  )
  .delete(
    protect,
    restrictedTo(UserRole.ADMINISTRATOR),
    clientController.deleteClient
  );

export default router;
