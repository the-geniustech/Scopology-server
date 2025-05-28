import { Router } from "express";
import * as QuotationControllers from "./quotations.controller";
import { protect } from "@middlewares/auth.middleware";

const router = Router();

router.use(protect);

router.post("/", QuotationControllers.createQuotation);

export default router;
