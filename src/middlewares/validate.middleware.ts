import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

type RequestPart = "body" | "query" | "params";

export const validate =
  (schema: ZodSchema<any>, part: RequestPart = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const formatted = result.error.format();
      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
        errors: formatted,
      });
    }

    // Replace the validated data to ensure it's clean
    req[part] = result.data;
    next();
  };
