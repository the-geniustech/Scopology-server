import { Request, Response, NextFunction } from "express";
import * as clientService from "./clients.service";
import { catchAsync } from "@utils/catchAsync";
import AppError from "@utils/appError";
import { sendSuccess } from "@utils/responseHandler";

export const createClient = catchAsync(async (req: Request, res: Response) => {
  const client = await clientService.createClient(req.body);
  sendSuccess({
    res,
    statusCode: 201,
    message: "Client created successfully",
    data: client,
  });
});

export const getClients = catchAsync(async (_req: Request, res: Response) => {
  const clients = await clientService.getClients();
  sendSuccess({
    res,
    message: "Clients fetched successfully",
    data: clients,
    results: clients.length,
  });
});

export const getClient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const client = await clientService.getClientById(req.params.id);

    if (!client) {
      return next(new AppError("Client not found", 404));
    }

    sendSuccess({ res, message: "Client fetched successfully", data: client });
  }
);

export const updateClient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const updatedClient = await clientService.updateClient(
      req.params.id,
      req.body
    );

    if (!updatedClient) {
      return next(new AppError("Client not found", 404));
    }

    sendSuccess({
      res,
      message: "Client updated successfully",
      data: updatedClient,
    });
  }
);

export const deleteClient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deleted = await clientService.deleteClient(req.params.id);

    if (!deleted) {
      return next(new AppError("Client not found", 404));
    }

    sendSuccess({
      res,
      statusCode: 204,
      message: "Client deleted successfully",
    });
  }
);
