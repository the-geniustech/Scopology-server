import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import AppError from "@utils/appError";

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedImageMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const allowedDocumentMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const imageFieldNames = ["clientLogo", "avatar"];
  const documentFieldNames = ["uploadedScopes"];

  if (imageFieldNames.includes(file.fieldname)) {
    if (!allowedImageMimeTypes.includes(file.mimetype)) {
      return cb(
        new AppError(
          "Invalid file type for clientLogo. Only images are allowed.",
          400
        )
      );
    }
  }

  if (documentFieldNames.includes(file.fieldname)) {
    if (
      !allowedDocumentMimeTypes.includes(file.mimetype) &&
      !allowedImageMimeTypes.includes(file.mimetype)
    ) {
      return cb(
        new AppError("Invalid file type for uploadedScopes upload.", 400)
      );
    }
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const uploadSingle = (fieldName: string) => upload.single(fieldName);

export const uploadMultiple = (fieldName: string, maxCount = 5) =>
  upload.array(fieldName, maxCount);

export const uploadFields = (fields: { name: string; maxCount?: number }[]) =>
  upload.fields(fields);

export const uploadClientLogoAndUploadedScopes = upload.fields([
  { name: "clientLogo", maxCount: 1 },
  { name: "uploadedScopes", maxCount: 10 },
]);
