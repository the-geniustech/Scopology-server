import User from "@models/User.model";
import { IUserDocument } from "@interfaces/user.interface";
import AppError from "@utils/appError";
import { env } from "@config/env";

import {
  getNextSequenceIdPreview,
  incrementSequenceId,
} from "@models/sequentialIdGenerator.util";
import { idFormatConfig } from "@constants/idPrefixes";
import { signToken, verifyToken } from "@utils/token.util";

export const inviteUser = async (
  data: Pick<IUserDocument, "fullName" | "email" | "roles">
): Promise<{
  user: IUserDocument;
  inviteLink: string;
}> => {
  const sequenceOptions = idFormatConfig["User"];
  const nextUserId = await getNextSequenceIdPreview("User", sequenceOptions);

  const user = await createUser({
    ...data,
    userId: nextUserId,
    password: nextUserId,
    status: "pending",
  });

  await incrementSequenceId("User", sequenceOptions);

  const token = signToken(
    { userId: user._id, type: "invite" },
    { expiresIn: "3d" }
  );
  const inviteLink = `${env.CLIENT_APP_URL}/accept-invite?token=${token}`;

  return { user, inviteLink };
};

export const resendInvite = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError("User not found", 404);

  if (user.status !== "pending") {
    throw new AppError("User has already accepted the invite", 400);
  }

  const token = signToken(
    { userId: String(user._id as string), type: "invite" },
    { expiresIn: "3d" }
  );

  const inviteLink = `${env.CLIENT_APP_URL}/accept-invite?token=${token}`;

  return { user, inviteLink };
};

export const createUser = async (
  data: Partial<IUserDocument>
): Promise<IUserDocument> => {
  const user = new User(data);
  return await user.save();
};

export const acceptInvite = async (
  token: string,
  newPassword: string
): Promise<IUserDocument> => {
  if (!token || !newPassword) {
    throw new AppError("Token and password are required", 400);
  }

  const decoded = verifyToken(token);

  if (decoded.type !== "invite") {
    throw new AppError("Invalid token type for this action", 403);
  }

  const user = await User.findById(decoded.userId).select("+password");
  if (!user) throw new AppError("User not found", 404);

  if (user.status === "active") {
    throw new AppError("Invite already accepted", 400);
  }

  user.password = newPassword;
  user.status = "active";
  user.dateJoined = new Date();

  return await user.save();
};

export const register = async (
  userData: Partial<IUserDocument>
): Promise<{ user: IUserDocument; token: string }> => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) throw new AppError("Email is already registered", 409);

  const user = await User.create(userData as IUserDocument);
  const token = signToken({ id: user._id, type: "access" });

  return { user, token };
};

export const login = async (
  email: string,
  password: string
): Promise<{ user: IUserDocument; token: string }> => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new AppError("Invalid email or password", 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError("Invalid email or password", 401);

  const token = signToken({ id: user._id, type: "access" });
  user.password = "";

  return { user, token };
};
