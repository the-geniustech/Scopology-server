import { ISiteVisit } from "@interfaces/siteVisit.interface";
import mongoose, { Schema, Document } from "mongoose";

const siteVisitSchema = new Schema<ISiteVisit>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    clientRepresentative: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contactMethod: {
      type: String,
      required: true,
    },
    siteVisitDate: {
      type: Date,
      required: true,
    },
    siteVisitTime: {
      type: String,
      required: true,
    },
    commuteTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "scheduled", "done", "cancelled"],
      required: true,
      default: "pending",
    },
    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    acceptedAt: {
      type: Date,
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

const SiteVisit = mongoose.model<ISiteVisit>("SiteVisit", siteVisitSchema);
export default SiteVisit;
