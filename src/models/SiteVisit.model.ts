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
      type: String,
      required: true,
      trim: true,
    },
    contactMethod: {
      type: String,
      enum: ["phone", "email", "in_person", "whatsapp", "other"],
      required: true,
    },
    siteVisitAt: {
      type: Date,
      required: true,
    },
    commuteTimeMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["scheduled", "done", "cancelled"],
      default: "scheduled",
    },
    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    acceptedAt: {
      type: Date,
    },

    notes: {
      type: String,
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
