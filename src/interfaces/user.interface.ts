import { Document } from "mongoose";

export interface IUserDocument extends Document {
  userId: string;
  fullName: string;
  email: string;
  password: string;
  roles: ("administrator" | "supervisor" | "super_admin")[];
  status: "pending" | "active" | "disabled";
  isActive: boolean;
  dateJoined: Date | null;
  lastLogin?: Date;
  deletedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
