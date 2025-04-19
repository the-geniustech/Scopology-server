// src/utils/validateZod.ts

import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import AppError from "./appError";

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      const zodErrors = err.errors?.map(
        (e: any) => `${e.path.join(".")}: ${e.message}`
      );
      return next(
        new AppError(`Validation error: ${zodErrors.join(" | ")}`, 400)
      );
    }
  };
};
