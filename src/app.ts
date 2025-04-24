import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import routes from "./api/v1/routes";
import globalErrorHandler from "./middlewares/error.middleware";
import AppError from "./utils/appError";

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

app.use("/api/v1", routes);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", message: "Scopology API is healthy" });
});

// ====== Global Error Handler ======
// Fallback route for undefined paths
app.use(async (req, res, next) => {
  next(new AppError(`This route ${req.originalUrl} does not exist.`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

export default app;
