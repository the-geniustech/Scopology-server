import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { env } from "@config/env";
import AppError from "@utils/appError";
import { StringValue } from "ms";
import { Response } from "express";

interface TokenPayload extends JwtPayload {
  type?: "access" | "invite" | "reset";
  [key: string]: any;
}

/**
 * Sign a JWT token with custom payload and optional expiration
 */
export const signToken = (
  payload: TokenPayload,
  options: SignOptions = {}
): string => {
  return jwt.sign(payload, env.JWT_SECRET!, {
    expiresIn: options.expiresIn || (env.JWT_EXPIRES_IN as StringValue),
    ...options,
  });
};

/**
 * Verify and decode a JWT token. Throws AppError if invalid.
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET!) as TokenPayload;
  } catch (err: any) {
    throw new AppError("Invalid or expired token", 401);
  }
};

export const setAccessTokenCookie = (res: Response, token: string) => {
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 15, // 15 minutes
  });
};
