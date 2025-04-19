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

// ====== Middleware Stack ======
app.use(helmet()); // Secure HTTP headers
app.use(cors()); // Enable CORS
app.use(morgan("dev")); // HTTP request logger
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
app.use(compression()); // Gzip compression

// ====== API Routes ======
app.use("/api/v1", routes); // Centralized route registry

// ====== Health Check ======
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", message: "Scopology API is healthy" });
});

// ====== Global Error Handler ======
// Fallback route for undefined paths
app.use(async (req, res, next) => {
  next(new AppError(`This route ${req.originalUrl} does not exist.`, 404));
});

// Error handling middleware
app.use(globalErrorHandler); // Custom error middleware

export default app;
