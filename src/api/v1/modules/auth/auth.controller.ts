import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user, token } = await AuthService.register(req.body);

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await AuthService.login(email, password);

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};
