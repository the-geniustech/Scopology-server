// src/api/v1/modules/users/user.validator.ts

import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import AppError from "../../../../utils/appError";

const rolesEnum = z.enum(["administrator", "supervisor"]);

const createUserSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email(),
  phoneNumber: z.string().min(7).optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roles: z.array(rolesEnum).nonempty(),
});

const updateUserSchema = z.object({
  fullName: z.string().min(3).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(7).optional(),
  password: z.string().min(6).optional(),
  roles: z.array(rolesEnum).optional(),
  isActive: z.boolean().optional(),
});

export const validateUserCreate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    req.body = createUserSchema.parse(req.body);
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
