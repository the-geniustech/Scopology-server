import { Request, Response } from "express";
import * as clientService from "./clients.service";
import { catchAsync } from "@utils/catchAsync";
import { sendSuccess } from "@utils/responseHandler";
import { search } from "@utils/search.util";
import Client from "@models/Client.model";
import { uploadSingleFileToCloudinary } from "@services/cloudinaryUpload.service";
import { APIFeatures } from "@utils/apiFeatures.util";

export const createClient = catchAsync(async (req: Request, res: Response) => {
  let logoData;

  if (req.file) {
    logoData = await uploadSingleFileToCloudinary(
      req.file.buffer,
      "clients",
      "logos"
    );

    req.body.clientLogo = logoData;
  }

  const client = await clientService.createClient(req.body);
  sendSuccess({
    res,
    statusCode: 201,
    message: "Client created successfully",
    data: { client },
  });
});

export const getClients = catchAsync(async (req: Request, res: Response) => {
  const baseUrl = `${req.baseUrl}${req.path}`;
  const features = new APIFeatures(Client.find({ deletedAt: null }), req.query);
  const { data: clients } = await features.applyAllFiltersWithPaginationMeta(
    baseUrl
  );

  return res.status(200).json({
    status: "success",
    message: "Clients retrieved successfully",
    results: clients.length,
    data: { clients },
  });
});

export const searchUsers = catchAsync(async (req: Request, res: Response) => {
  const keyword = req.query.q as string;

  const clients = await search({
    model: Client,
    keyword,
    searchFields: [
      "clientName",
      "clientPhone",
      "clientEmail",
    ],
    selectFields:
      "clientName clientPhone clientEmail createdAt clientLogo clientNatureOfBusiness",
  });

  return sendSuccess({
    res,
    message: "Client search results",
    results: clients.length,
    data: { clients },
  });
});
