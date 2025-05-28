import Quotation from "@models/Quotation.model";
import Project from "@models/Project.model";
import { IQuotation } from "@interfaces/quotation.interface";
import AppError from "@utils/appError";

export const createQuotation = async (
  data: IQuotation
): Promise<IQuotation> => {
  const quotation = await Quotation.create(data);

  const projectUpdate = await Project.findByIdAndUpdate(
    data.projectId,
    { quotation: quotation._id },
    { new: true }
  );

  if (!projectUpdate) {
    throw new AppError("Project not found to associate quotation", 404);
  }

  return quotation;
};

/*
export const createQuotation = async (
  data: Partial<IQuotation>
): Promise<IQuotation> => {
  //   const totalAmount = calculateQuotationTotal(data);
  //   const quotation = new Quotation({ ...data, totalAmount });
  const quotation = new Quotation({ ...data });
  return await quotation.save();
};

const calculateQuotationTotal = (data: Partial<IQuotation>): number => {
  let total = 0;

  if (data.employeeRates && data.workingDays) {
    const dailyRates =
      data.workingDays.weekdays +
      data.workingDays.saturdays +
      data.workingDays.sundays +
      data.workingDays.publicHolidays;

    total += Number(data.employeeRates) * dailyRates;
  }

  // You can plug in unit costs, inventory APIs, or weightage here later
  total += (data.equipmentAndTools?.length || 0) * 500;
  total += (data.consumables?.length || 0) * 300;
  total += (data.subcontractors?.length || 0) * 400;
  total += (data.suppliers?.length || 0) * 200;
  total += (data.materials?.length || 0) * 250;

  return total;
};
 */
