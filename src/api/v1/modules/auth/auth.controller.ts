import { Request, Response, NextFunction } from "express";
import * as AuthService from "./auth.service";
import { catchAsync } from "@utils/catchAsync";
import { sendSuccess } from "@utils/responseHandler";
import { sendUserInviteEmail } from "services/mail/templates/sendUserInviteEmail";

// Temporary/test function to signup a user
export const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user, token } = await AuthService.register(req.body);

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user,
        token,
      },
    });
  }
);

export const inviteUser = catchAsync(async (req: Request, res: Response) => {
  const { user, inviteLink } = await AuthService.inviteUser(req.body);

  await sendUserInviteEmail({ user, inviteLink });

  return sendSuccess({
    res,
    statusCode: 201,
    message: "User invited successfully. An invite email has been sent.",
    data: {
      fullName: user.fullName,
      email: user.email,
      userId: user.userId,
      status: user.status,
      roles: user.roles,
    },
  });
});

export const resendInvite = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  const { user, inviteLink } = await AuthService.resendInvite(email);

  await sendUserInviteEmail({ user, inviteLink, isResend: true });

  return sendSuccess({
    res,
    message: "Invite re-sent successfully",
    data: {
      fullName: user.fullName,
      email: user.email,
      userId: user.userId,
    },
  });
});

export const acceptInvite = catchAsync(async (req, res) => {
  const { token, password } = req.body;

  const user = await AuthService.acceptInvite(token, password);

  return sendSuccess({
    res,
    message: "Account activated. You can now log in.",
    data: {
      fullName: user.fullName,
      email: user.email,
      status: user.status,
    },
  });
});

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
