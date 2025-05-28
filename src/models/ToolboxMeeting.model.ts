import { Schema, model } from "mongoose";
import { IToolboxMeetingDocument } from "@interfaces/toolboxMeeting.interface";

const toolboxMeetingSchema = new Schema<IToolboxMeetingDocument>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    projectName: { type: String, required: true },
    jobNumber: { type: String, required: true },
    jobLocation: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    numberOfCrew: { type: Number, required: true },
    supervisor: { type: String, required: true },
    completedBy: { type: String, required: true },
    topicDiscussed: { type: String, required: true },
    additionalNotes: { type: String },

    acknowledgements: [
      {
        fullName: { type: String, required: true },
        signature: {
          type: String,
          required: true,
        },
      },
    ],

    documentNumber: { type: String, required: true },
    issueDate: { type: Date, required: true },
    revisionNumber: { type: String, required: true },

    foremanOrSupervisorSignature: {
      type: String,
      required: true,
    },
    conductedBySignature: {
      type: String,
      required: true,
    },

    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

export default model<IToolboxMeetingDocument>(
  "ToolboxMeeting",
  toolboxMeetingSchema
);
