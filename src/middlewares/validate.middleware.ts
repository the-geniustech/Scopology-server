import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema } from "zod";
import AppError from "../utils/appError";

type RequestPart = "body" | "query" | "params";

export const validate = (
  schema: ZodSchema,
  part: RequestPart = "body"
): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req[part] = schema.parse(req[part]);
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
