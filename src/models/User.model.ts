import { Query, Schema, model } from "mongoose";
import { IUserDocument } from "@interfaces/user.interface";
import bcrypt from "bcrypt";

const userSchema = new Schema<IUserDocument>(
  {
    userId: {
      type: String,
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
      required: true,
      unique: true,
    },
    avatar: {
      type: {
        url: String,
        publicId: String,
      },
    },
    password: {
      type: String,
      required: true,
      min: [5, "Password must be at least 4 characters"],
      select: false,
    },
    roles: {
      type: [String],
      enum: ["administrator", "supervisor", "super_admin"],
      default: ["supervisor"],
    },
    status: {
      type: String,
      enum: ["pending", "active", "disabled"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    dateJoined: {
      type: Date,
      default: null,
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

userSchema.pre(
  /^find/,
  function (this: Query<IUserDocument, IUserDocument>, next: Function) {
    // `this` refers to the current query
    this.find({ isActive: { $ne: false } });
    next();
  }
);

userSchema.pre<IUserDocument>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = model<IUserDocument>("User", userSchema);
export default User;
