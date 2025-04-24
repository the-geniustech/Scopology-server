import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "@utils/appError";
import User from "@models/User.model";
import { IUserDocument } from "@interfaces/user.interface";
import { catchAsync } from "@utils/catchAsync";

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

export const protect = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    let token;

    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("You are not logged in. Please provide a token.", 401)
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    // Find user by ID
    const currentUser = await User.findById(decoded.id);
    if (!currentUser || currentUser.deletedAt) {
      return next(new AppError("The user no longer exists.", 401));
    }

    // Attach user to request object
    req.user = currentUser;
    next();
  }
);

export const restrictedTo = (
  ...roles: ("administrator" | "supervisor" | "super_admin")[]
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user as IUserDocument;

    if (!user || !user.roles.some((role) => roles.includes(role))) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }

    next();
  };
};
