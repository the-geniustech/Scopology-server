import { Schema, model } from "mongoose";
import { IScopeDocument } from "@interfaces/scope.interface";

const scopeSchema = new Schema<IScopeDocument>(
  {
    scopeId: {
      type: String,
      required: true,
      unique: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    documents: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "in-review"],
      default: "pending",
    },
    createdFrom: {
      type: String,
      enum: ["manual", "client_upload", "site_visit", "AI"],
      default: "manual",
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

const Scope = model<IScopeDocument>("Scope", scopeSchema);
export default Scope;
