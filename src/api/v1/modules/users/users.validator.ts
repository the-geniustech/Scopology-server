import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import AppError from "@utils/appError";

const rolesEnum = z.enum(["administrator", "supervisor"]);

const updateUserSchema = z.object({
  fullName: z.string().min(3).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(7).optional(),
  password: z.string().min(6).optional(),
  roles: z.array(rolesEnum).optional(),
  isActive: z.boolean().optional(),
});

export const validateUserUpdate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    req.body = updateUserSchema.parse(req.body);
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
