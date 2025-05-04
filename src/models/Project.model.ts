import { Schema, model } from "mongoose";
import { IProjectDocument } from "@interfaces/project.interface";

const projectSchema = new Schema<IProjectDocument>(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused", "cancelled"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    scopes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Scope",
      },
    ],
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

const Project = model<IProjectDocument>("Project", projectSchema);
export default Project;
