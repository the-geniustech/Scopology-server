import { Request, Response, NextFunction } from "express";
import { IUserDocument } from "@interfaces/user.interface";

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;
