import { Request, Response } from "express";
import { catchAsync } from "@utils/catchAsync";
import { sendSuccess } from "@utils/responseHandler";
import AppError from "@utils/appError";
import ToolboxMeetingModel from "@models/ToolboxMeeting.model";
import { IToolboxMeeting } from "@interfaces/toolboxMeeting.interface";
import dayjs from "dayjs";
import { renderPDF } from "@services/pdf/renderPDF";
import { IProjectDocument } from "@interfaces/project.interface";
import { sendFileAsDownload } from "@utils/sendFileAsDownload";

export const createToolboxMeetingForm = catchAsync(
  async (req: Request, res: Response) => {
    const { id: userId } = req.user as { id: string };

    const toolboxMeetingData: Partial<IToolboxMeeting> = {
      ...req.body,
      addedBy: userId,
    };

    const createdMeeting = await ToolboxMeetingModel.create(toolboxMeetingData);

    if (!createdMeeting) {
      throw new AppError("Toolbox meeting could not be created", 500);
    }

    return sendSuccess({
      res,
      statusCode: 201,
      message: "Toolbox meeting created successfully",
      data: createdMeeting,
    });
  }
);

export const updateToolboxMeetingForm = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const updated = await ToolboxMeetingModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new AppError("Toolbox meeting not found", 404);
    }

    return sendSuccess({
      res,
      message: "Toolbox meeting updated successfully",
      data: updated,
    });
  }
);

export const downloadToolboxPDF = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const toolbox = await ToolboxMeetingModel.findById(id)
      .populate({
        path: "project",
        select: "title projectId clientName clientLogo",
      })
      .lean();

    if (!toolbox) {
      throw new AppError("Toolbox Meeting not found", 404);
    }

    const project = toolbox.project as unknown as IProjectDocument;

    const formattedData = {
      ...toolbox,
      date: dayjs(toolbox.date).format("DD/MM/YYYY"),
      issueDate: dayjs(toolbox.issueDate).format("DD/MM/YYYY"),
      time: toolbox.time,
      projectName: project?.title,
      project: {
        clientName: project?.clientName,
        projectId: project?.projectId,
        clientLogo:
          "https://res.cloudinary.com/dy1anrer8/image/upload/v1747217021/clients/logos/dxnxcv2stlecuyfatssp.png",
      },
      acknowledgements: (toolbox.acknowledgements || []).map((ack) => ({
        fullName: ack.fullName,
        signature: ack.signature,
      })),
      conductedBySignature: Array.isArray(toolbox.conductedBySignature)
        ? toolbox.conductedBySignature
        : [],
    };

    const pdfBuffer = await renderPDF("toolboxMeeting", formattedData);

    const safeFileName = `Toolbox_Meeting_${project?.projectId || "Form"}.pdf`;

    return sendFileAsDownload(res, pdfBuffer, safeFileName);
  }
);
