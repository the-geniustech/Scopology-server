import { Router } from "express";

// Import module routes
import authRoutes from "@modules/auth/auth.routes";
import userRoutes from "@modules/users/users.routes";
import clientRoutes from "@modules/clients/clients.routes";
import scopeRoutes from "@modules/scope/scope.routes";
// import siteVisitRoutes from "@modules/site-visits/siteVisit.routes";
// import projectRoutes from "@modules/projects/project.routes";

const router = Router();

// Versioned API root
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/clients", clientRoutes);
router.use("/scopes", scopeRoutes);
// router.use("/site-visit", siteVisitRoutes);
// router.use("/projects", projectRoutes);

export default router;
