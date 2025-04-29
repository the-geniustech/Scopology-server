import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema } from "zod";
import AppError from "../utils/appError";

type RequestPart = "body" | "query" | "params";

export const validate = (
  schema: ZodSchema,
  part: RequestPart = "body"
): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    console.log("validate FN", req[part]);
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

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: string[] };

export const validateData = <T>(
  schema: ZodSchema<T>,
  data: unknown,
  safe: boolean = false
): T | ValidationResult<T> => {
  console.log("validateData FN", data);
  try {
    const parsed = schema.parse(data);
    return safe ? { success: true, data: parsed } : parsed;
  } catch (err: any) {
    const zodErrors = err.errors?.map(
      (e: any) => `${e.path.join(".")}: ${e.message}`
    );

    if (safe) {
      return { success: false, errors: zodErrors || ["Validation failed"] };
    }

    throw new AppError(`Validation error: ${zodErrors.join(" | ")}`, 400);
  }
};
