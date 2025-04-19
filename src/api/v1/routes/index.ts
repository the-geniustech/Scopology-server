import { Router } from "express";

// Import module routes
import authRoutes from "../modules/auth/auth.routes";
// import projectRoutes from "../modules/projects/project.routes";
// import scopeRoutes from "../modules/scopes/scope.routes";

const router = Router();

// Versioned API root
router.use("/auth", authRoutes);
// router.use("/projects", projectRoutes);
// router.use("/scopes", scopeRoutes);

export default router;
