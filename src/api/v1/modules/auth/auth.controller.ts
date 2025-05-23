import { Request, Response, NextFunction } from "express";
import * as AuthService from "./auth.service";
import { catchAsync } from "@utils/catchAsync";
import { sendSuccess } from "@utils/responseHandler";
import { sendUserInviteEmail } from "services/mail/templates/sendUserInviteEmail";
import { setAccessTokenCookie, signToken } from "@utils/token.util";
import { env } from "@config/env";
import AppError from "@utils/appError";
import { sendResetPasswordEmail } from "@services/mail/templates/sendResetPasswordEmail";

export const signupSuperAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fullName, email, password, setupSecret } = req.body;
    console.log("Body", req.body);

    if (env.NODE_ENV !== "development") {
      return next(
        new AppError(
          "Super admin setup is not allowed in this environment.",
          403
        )
      );
    }

    if (setupSecret !== env.SUPERADMIN_SETUP_SECRET) {
      return next(new AppError("Invalid setup secret.", 401));
    }

    const superAdmin = await AuthService.signupSuperAdmin({
      fullName,
      email,
      password,
    });

    const accessToken = signToken({ id: superAdmin._id, type: "access" });
    setAccessTokenCookie(res, accessToken);

    return sendSuccess({
      res,
      statusCode: 201,
      message: "Super administrator account created and logged in.",
      data: {
        fullName: superAdmin.fullName,
        email: superAdmin.email,
        roles: superAdmin.roles,
        userId: superAdmin.userId,
      },
    });
  }
);

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await AuthService.login(email, password);
  const accessToken = signToken({
    id: String(user._id as string),
    type: "access",
  });

  setAccessTokenCookie(res, accessToken);

  return sendSuccess({
    res,
    message: "Login successful",
    data: {
      user: {
        fullName: user.fullName,
        email: user.email,
        userId: user.userId,
        roles: user.roles,
        status: user.status,
      },
      accessToken,
    },
  });
});

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
  const { token } = req.body;

  const { user, accessToken } = await AuthService.acceptInvite(token);

  setAccessTokenCookie(res, accessToken);

  return sendSuccess({
    res,
    message: "Account activated successfully. You are now logged in.",
    data: {
      user: {
        fullName: user.fullName,
        email: user.email,
        status: user.status,
        roles: user.roles,
        userId: user.userId,
      },
      accessToken,
    },
  });
});

export const revokeInvite = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  await AuthService.revokeInvite(email);

  return sendSuccess({
    res,
    message: "Invite revoked successfully",
  });
});

export const requestPasswordReset = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const { token, userFullName } = await AuthService.requestPasswordReset(
      email
    );

    // Always respond success to avoid account enumeration
    if (token) {
      const resetLink = `${process.env.CLIENT_APP_URL}/reset-password?token=${token}`;

      await sendResetPasswordEmail({
        to: email,
        fullName: userFullName,
        resetLink,
      });
    }

    return sendSuccess({
      res,
      message:
        "If this email is associated with an account, a password reset link has been sent.",
    });
  }
);

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token, newPassword, confirmNewPassword } = req.body;

  if (newPassword !== confirmNewPassword) {
    throw new AppError("Passwords do not match", 400);
  }

  await AuthService.resetPassword(token, newPassword);

  return sendSuccess({
    res,
    message: "Your password has been reset successfully. You can now log in.",
  });
});
