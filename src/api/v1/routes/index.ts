import { Router } from "express";

// Import module routes
import authRoutes from "@modules/auth/auth.routes";
import userRoutes from "@modules/users/users.routes";
import clientRoutes from "@modules/clients/clients.routes";
import scopeRoutes from "@modules/scope/scope.routes";
import projectRoutes from "@modules/projects/projects.routes";
import siteVisitRoutes from "@modules/site-visits/siteVisit.routes";

const router = Router();

// Versioned API root
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/clients", clientRoutes);
router.use("/scopes", scopeRoutes);
router.use("/projects", projectRoutes);
router.use("/site-visit", siteVisitRoutes);

export default router;
