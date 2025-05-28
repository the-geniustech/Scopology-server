import { Request, Response, NextFunction } from "express";
import dayjs from "dayjs";
import AppError from "@utils/appError";

const toNumber = (val: any): number | null => {
  const num = Number(val);
  return isNaN(num) ? null : num;
};

const toDateISOString = (val: any): string | null => {
  const d = dayjs(val);
  return d.isValid() ? d.toISOString() : null;
};

export const parseToolboxFormData = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;

    if (body.numberOfCrew) {
      const casted = toNumber(body.numberOfCrew);
      if (casted === null)
        throw new AppError("Invalid numberOfCrew format", 400);
      body.numberOfCrew = casted;
    }

    if (body.date) {
      const iso = toDateISOString(body.date);
      if (!iso) throw new AppError("Invalid date format", 400);
      body.date = iso;
    }

    if (body.issueDate) {
      const iso = toDateISOString(body.issueDate);
      if (!iso) throw new AppError("Invalid issueDate format", 400);
      body.issueDate = iso;
    }

    if (body.time && typeof body.time === "string") {
      body.time = body.time.toUpperCase();
    }

    req.body = body;
    next();
  } catch (err) {
    next(err);
  }
};
