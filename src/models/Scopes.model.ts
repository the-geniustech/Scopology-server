import { Schema, model } from "mongoose";
import { IScopeDocument } from "@interfaces/scope.interface";

const scopeSchema = new Schema<IScopeDocument>(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    scopeTitle: {
      type: String,
      required: true,
    },
    scopeOverview: {
      type: String,
      required: true,
    },
    scopeId: {
      type: String,
      required: true,
      unique: true,
    },
    entryRequirements: {
      type: [String],
      default: [],
    },
    natureOfWork: {
      type: [String],
      required: true,
    },
    isUploadedScopes: {
      type: Boolean,
      default: false,
    },
    uploadedScopes: {
      type: [Object],
      validate: {
        validator(v: Object[]) {
          return this.isUploadedScopes ? v.length > 0 : true;
        },
        message: (props: any) => `${props.path} must have at least one item.`,
      },
    },
    progress: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    rejectionMessage: {
      type: String,
      default: null,
    },
    source: {
      type: String,
      enum: ["manual", "client_upload", "AI"],
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
