import { Request, Response } from "express";
import * as QoutationServices from "./quotations.service";
import { catchAsync } from "@utils/catchAsync";
import { sendSuccess } from "@utils/responseHandler";

export const createQuotation = catchAsync(
  async (req: Request, res: Response) => {
    const { id: userId } = req.user!;
    const quotationData = {
      ...req.body,
      createdBy: userId,
    };

    const quotation = await QoutationServices.createQuotation(quotationData);

    return sendSuccess({
      res,
      statusCode: 201,
      message: "Quotation created successfully and linked to project.",
      data: { quotation },
    });
  }
);
