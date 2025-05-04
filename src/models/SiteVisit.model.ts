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
      required: true,
    },
    clientRepPhone: {
      type: String,
      validate: {
        validator: function (v: string): boolean {
          return /^\+?[1-9]\d{1,14}$/.test(v);
        },
        message: (props: { value: string }) =>
          `${props.value} is not a valid phone number!`,
      },
      required: true,
      trim: true,
    },
    clientRepEmail: {
      type: String,
      validate: {
        validator: function (v: string): boolean {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: (props: { value: string }) =>
          `${props.value} is not a valid email address!`,
      },
      required: true,
      trim: true,
    },
    siteVisitDate: {
      type: Date,
      required: true,
    },
    siteVisitTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string): boolean {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: (props: { value: string }) =>
          `${props.value} is not a valid time format!`,
      },
    },
    commuteTimeMinutes: {
      type: Number,
      required: [true, "Commute time is required"],
      min: 0,
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
