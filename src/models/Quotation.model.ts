import { Schema, model } from "mongoose";
import { IQuotationDocument } from "@interfaces/quotation.interface";

const quotationSchema = new Schema<IQuotationDocument>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    employeeSkillset: {
      type: [String],
      required: true,
    },
    employeeRate: {
      type: Number,
      required: true,
    },
    workingDays: {
      weekdays: { type: Number, required: true },
      saturdays: { type: Number, required: true },
      sundays: { type: Number, required: true },
      publicHolidays: { type: Number, required: true },
    },
    equipmentsAndTools: {
      type: [String],
      required: true,
    },
    consumables: {
      type: [String],
      required: true,
    },
    subcontractors: {
      type: [String],
      required: true,
    },
    suppliers: {
      type: [String],
      required: true,
    },
    materials: {
      type: [String],
      required: true,
    },
    others: {
      type: String,
    },
    // totalAmount: {
    //   type: Number,
    //   required: true,
    // },
    createdBy: {
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

const Quotation = model<IQuotationDocument>("Quotation", quotationSchema);
export default Quotation;
