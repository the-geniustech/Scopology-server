import { Document, Types } from "mongoose";

export interface IToolboxMeetingAcknowledgement {
  fullName: string;
  signature: string;
}

export interface IToolboxMeeting {
  project: Types.ObjectId;
  projectName: string;
  jobNumber: string;
  jobLocation: string;
  date: Date;
  time: string;
  numberOfCrew: number;
  supervisor: string;
  completedBy: string;
  topicDiscussed: string;
  additionalNotes?: string;
  acknowledgements: IToolboxMeetingAcknowledgement[];

  documentNumber: string;
  issueDate: Date;
  revisionNumber: string;

  foremanOrSupervisorSignature: string;
  conductedBySignature: string;

  addedBy: Types.ObjectId;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IToolboxMeetingDocument extends Document, IToolboxMeeting {}
