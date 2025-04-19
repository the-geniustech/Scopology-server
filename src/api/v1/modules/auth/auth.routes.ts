import { Router } from "express";
import { loginUser, registerUser } from "./auth.controller";

const router = Router();

router.post("/login", loginUser);
router.post("/add-user", registerUser);

export default router;
