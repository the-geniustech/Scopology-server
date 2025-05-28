import { Document, Types } from "mongoose";

export interface IQuotation {
  projectId: Types.ObjectId;
  employeeSkillset: string[];
  employeeRate: number;
  workingDays: {
    weekdays: number;
    saturdays: number;
    sundays: number;
    publicHolidays: number;
  };
  equipmentsAndTools: string[];
  consumables: string[];
  subcontractors: string[];
  suppliers: string[];
  materials: string[];
  others?: string;
  // totalAmount: number;
  createdBy: Types.ObjectId;
  deletedAt?: Date;
}

export interface IQuotationDocument extends IQuotation, Document {}
