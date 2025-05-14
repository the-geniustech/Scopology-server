import { Schema, model } from "mongoose";
import { IProjectDocument } from "@interfaces/project.interface";

const projectSchema = new Schema<IProjectDocument>(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    scope: {
      type: Schema.Types.ObjectId,
      ref: "Scope",
      required: true,
    },
    quotation: {
      type: Schema.Types.ObjectId,
      ref: "Quotation",
    },
    siteVisits: [
      {
        type: Schema.Types.ObjectId,
        ref: "SiteVisit",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    progress: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused", "cancelled"],
      default: "active",
    },
    // startDate: {
    //   type: Date,
    //   required: true,
    // },
    // expectedCompletionDate: Date,
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    deletedAt: {
      type: Date,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Project = model<IProjectDocument>("Project", projectSchema);
export default Project;
