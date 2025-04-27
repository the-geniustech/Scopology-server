import { Response } from "express";

type SuccessResponseOptions<T> = {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
  results?: number;
};

export const sendSuccess = <T>({
  res,
  statusCode = 200,
  message = "Request successful",
  data,
  results,
}: SuccessResponseOptions<T>) => {
  const response: any = {
    status: "success",
    message,
  };

  if (typeof results === "number") response.results = results;
  if (typeof data !== "undefined") response.data = data;

  return res.status(statusCode).json(response);
};
