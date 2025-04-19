import { Document } from "mongoose";

export interface IUserDocument extends Document {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  roles: ("administrator" | "supervisor")[];
  isActive: boolean;
  lastLogin?: Date;
  deletedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
