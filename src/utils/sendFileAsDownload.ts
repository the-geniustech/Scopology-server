import { Response } from "express";

export const sendFileAsDownload = (
  res: Response,
  buffer: Buffer,
  filename: string,
  mimeType: string = "application/pdf"
): Response => {
  res.set({
    "Content-Type": mimeType,
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Content-Length": buffer.length,
  });

  return res.status(200).send(buffer);
};
