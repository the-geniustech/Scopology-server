import User from "@models/User.model";
import { IUserDocument } from "@interfaces/user.interface";
import AppError from "@utils/appError";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "@config/env";
import { StringValue } from "ms";

export class AuthService {
  /**
   * Register a new user
   */
  static async register(
    userData: Partial<IUserDocument>
  ): Promise<{ user: IUserDocument; token: string }> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) throw new AppError("Email is already registered", 409);

    const user = await User.create(userData as IUserDocument);
    const token = this.signToken(user._id as string); // Ensure _id is treated as string

    return { user, token };
  }

  /**
   * Login an existing user
   */
  static async login(
    email: string,
    password: string
  ): Promise<{ user: IUserDocument; token: string }> {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new AppError("Invalid email or password", 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new AppError("Invalid email or password", 401);

    const token = this.signToken(user._id as string);
    user.password = ""; // Don't return hashed password

    return { user, token };
  }

  /**
   * Generate JWT
   */
  private static signToken(userId: string): string {
    const payload = { id: userId };
    const secret = env.JWT_SECRET as jwt.Secret;
    const options: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as StringValue,
    };

    return jwt.sign(payload, secret, options);
  }
}
