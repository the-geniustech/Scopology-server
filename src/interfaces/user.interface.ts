import { Document } from "mongoose";

export interface IUserDocument extends Document {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatar?: { url: string; publicId: string };
  password: string;
  roles: ("administrator" | "supervisor" | "super_admin")[];
  status: "pending" | "active" | "disabled";
  isActive: boolean;
  active: boolean;
  dateJoined: Date | null;
  lastLogin?: Date;
  deletedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
