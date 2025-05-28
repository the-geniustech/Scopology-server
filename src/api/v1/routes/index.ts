import { Router } from "express";
import authRoutes from "@modules/auth/auth.routes";
import userRoutes from "@modules/users/users.routes";
import clientRoutes from "@modules/clients/clients.routes";
import scopeRoutes from "@modules/scope/scope.routes";
import projectRoutes from "@modules/projects/projects.routes";
import siteVisitRoutes from "@modules/site-visits/siteVisit.routes";
import quotationRoutes from "@modules/quotations/quotations.routes";
import taskRoutes from "@modules/tasks/task.routes";
import toolboxRoutes from "@modules/toolbox/toolbox.routes";
const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/clients", clientRoutes);
router.use("/scopes", scopeRoutes);
router.use("/projects", projectRoutes);
router.use("/site-visit", siteVisitRoutes);
router.use("/quotations", quotationRoutes);
router.use("/tasks", taskRoutes);
router.use("/toolbox", toolboxRoutes);

export default router;
