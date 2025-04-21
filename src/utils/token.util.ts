import jwt from "jsonwebtoken";

export const generateInviteToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "3d", // 3 days expiration
  });
};
