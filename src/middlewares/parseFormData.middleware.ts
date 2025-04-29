import { Request, Response, NextFunction } from "express";

export const parseFormData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    req.headers["content-type"]?.includes("multipart/form-data") &&
    req.body
  ) {
    for (const key in req.body) {
      let value = req.body[key];

      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);

          if (typeof parsed === "object" || Array.isArray(parsed)) {
            req.body[key] = parsed;
            continue;
          }
        } catch (err) {
          // not a JSON object or array, continue
        }

        // Then handle pure booleans manually
        const lowered = value.toLowerCase();
        if (lowered === "true") {
          req.body[key] = true;
        } else if (lowered === "false") {
          req.body[key] = false;
        }
      }
    }
  }
  next();
};
