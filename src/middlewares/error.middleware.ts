import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import AppError from "@utils/appError";
import logger from "@config/logger";

dotenv.config();

/**
 * Handle Mongoose CastError (invalid ObjectId, etc.)
 */
const handleCastErrorDB = (err: mongoose.Error.CastError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: any): AppError => {
  const value = err.keyValue ? Object.values(err.keyValue).join(", ") : "";
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 409);
};

const handleValidationErrorDB = (
  err: mongoose.Error.ValidationError
): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = (): AppError =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = (): AppError =>
  new AppError("Your token has expired! Please log in again.", 401);

const sendErrorDev = (err: any, req: Request, res: Response): Response => {
  logger.error(`💥 ${err.stack}`);
  return res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err: any, req: Request, res: Response): Response => {
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message,
    });
  }

  logger.error(`💥 Unexpected Error: ${err.message || "No message provided"}`);
  return res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
};

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = Object.create(err);
  if (!error.message) error.message = err.message;
  if (!error.name) error.name = err.name;

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    if (error.name === "CastError")
      error = handleCastErrorDB(error as mongoose.Error.CastError);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error as mongoose.Error.ValidationError);
    if (error instanceof JsonWebTokenError) error = handleJWTError();
    if (error instanceof TokenExpiredError) error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

export default errorHandler;
