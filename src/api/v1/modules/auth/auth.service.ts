import User from "@models/User.model";
import { IUserDocument } from "@interfaces/user.interface";
import AppError from "@utils/appError";
import { env } from "@config/env";

import {
  getNextSequenceIdPreview,
  incrementSequenceId,
} from "@utils/sequentialIdGenerator.util";
import { idFormatConfig } from "@constants/idPrefixes";
import { signToken, verifyToken } from "@utils/token.util";

export const findSuperAdmin = async (): Promise<IUserDocument> => {
  const superAdmin = await User.findOne({ roles: "super_admin" });
  if (!superAdmin) {
    throw new AppError("Super administrator not found.", 404);
  }
  return superAdmin;
};

export const signupSuperAdmin = async ({
  fullName,
  email,
  password,
}: {
  fullName: string;
  email: string;
  password: string;
}): Promise<IUserDocument> => {
  const existingAdmin = await findSuperAdmin();

  if (existingAdmin) {
    throw new AppError("Super administrator already exists.", 403);
  }

  const nextUserId = await getNextSequenceIdPreview("User");

  const user = await createUser({
    fullName,
    email,
    password,
    userId: nextUserId,
    roles: ["administrator", "supervisor", "super_admin"],
    status: "active",
    dateJoined: new Date(),
  });

  await incrementSequenceId("User", idFormatConfig["User"]);

  return user;
};

export const login = async (
  email: string,
  password: string
): Promise<IUserDocument> => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new AppError("Invalid email or password", 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError("Invalid email or password", 401);

  if (user.status !== "active") {
    if (user.status === "pending") {
      throw new AppError("Your account is not yet activated.", 403);
    }
    if (user.status === "disabled")
      throw new AppError(
        "Your account has been disabled. Contact support.",
        403
      );
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateModifiedOnly: true });

  return user;
};

export const inviteUser = async (
  data: Pick<IUserDocument, "fullName" | "email" | "roles">
): Promise<{
  user: IUserDocument;
  inviteLink: string;
}> => {
  const nextUserId = await incrementSequenceId("User");

  const user = await createUser({
    ...data,
    userId: nextUserId,
    password: nextUserId,
    status: "pending",
  });

  await incrementSequenceId("User");

  const token = signToken(
    { userId: String(user._id as string), type: "invite" },
    { expiresIn: "3d" }
  );
  const inviteLink = `${env.CLIENT_APP_URL}/accept-invite?token=${token}`;

  return { user, inviteLink };
};

export const resendInvite = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError("User not found", 404);

  if (user.status === "active") {
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
  return await user.save({ validateModifiedOnly: true });
};

export const acceptInvite = async (
  token: string
): Promise<{ user: IUserDocument; accessToken: string }> => {
  const decoded = verifyToken(token);

  if (decoded.type !== "invite") {
    throw new AppError("Invalid token type for this action", 403);
  }

  const user = await User.findById(decoded.userId).select("+password");
  if (!user) throw new AppError("User not found", 404);

  if (user.status !== "pending") {
    throw new AppError("Only pending invites can be accepted", 400);
  }

  user.status = "active";
  user.dateJoined = new Date();

  await user.save({ validateModifiedOnly: true });

  const accessToken = signToken({ id: user._id, type: "access" });

  return { user, accessToken };
};

export const revokeInvite = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.status !== "pending") {
    throw new AppError("Only pending invites can be revoked", 400);
  }

  user.status = "disabled";
  user.deletedAt = new Date();
  await user.save({ validateModifiedOnly: true });
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
