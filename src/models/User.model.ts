import mongoose, { Schema, model } from "mongoose";
import { IUserDocument } from "../interfaces/user.interface";
import bcrypt from "bcrypt";
import { Counter } from "./Counter.model";

const userSchema = new Schema<IUserDocument>(
  {
    userId: {
      type: Number,
      unique: true,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    roles: {
      type: [String],
      enum: ["administrator", "supervisor"],
      default: ["supervisor"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// (async () => {
//   await Counter.create({ _id: "User" });
// })();

// Pre-save to generate auto-increment userId
userSchema.pre<IUserDocument>("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      "User",
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    console.log("Counter:", counter);

    this.userId = counter!.seq;
  }
});

// 🔐 Password Hashing Middleware
userSchema.pre<IUserDocument>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Compare Password Instance Method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = model<IUserDocument>("User", userSchema);
export default User;
