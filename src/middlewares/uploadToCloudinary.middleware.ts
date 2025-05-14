// src/middlewares/uploadToCloudinary.middleware.ts
import { Request, Response, NextFunction } from "express";
import {
  deleteFileFromCloudinary,
  uploadMultipleFilesToCloudinary,
  uploadSingleFileToCloudinary,
} from "@services/cloudinaryUpload.service";
import AppError from "@utils/appError";
import { Model } from "mongoose";
import cloudinary from "@config/cloudinary.config";

interface UploadToCloudinaryOptions {
  fieldName: string;
  baseFolder: string;
  subFolder?: string;
  deleteExisting?: boolean;
  collectionName?: string;
  model?: Model<any>;
}

export const uploadToCloudinary = ({
  fieldName,
  baseFolder,
  subFolder,
  deleteExisting = false,
  collectionName,
  model,
}: UploadToCloudinaryOptions) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.file || !req.file.buffer) {
        return next();
      }

      // 🔄 Delete existing file if required
      if (deleteExisting && collectionName && model) {
        let entityId =
          (req as any)?.[collectionName]?.id ||
          req?.params?.[`${collectionName}Id`] ||
          req?.body?.[`${collectionName}Id`];

        if (!entityId) {
          return next(
            new AppError(
              `Missing ${collectionName} ID for deletion lookup`,
              400
            )
          );
        }

        const existingDoc = await model.findById(entityId);

        if (!existingDoc) {
          return next(
            new AppError(`No ${collectionName} found with ID: ${entityId}`, 404)
          );
        }

        const existingFile = existingDoc[fieldName];

        if (existingFile?.publicId) {
          await deleteFileFromCloudinary(existingFile.publicId);
        }
      }

      // ☁️ Upload new file to Cloudinary
      const uploadResult = await uploadSingleFileToCloudinary(
        req.file.buffer,
        baseFolder,
        subFolder
      );

      req.body[fieldName] = uploadResult;
      next();
    } catch (err) {
      next(err);
    }
  };
};

interface MultiUploadOptions {
  fieldName: string;
  baseFolder: string;
  subFolder?: string;
  deleteExisting?: boolean;
  collectionName?: string;
  model?: Model<any>;
}

export const uploadMultipleToCloudinary = ({
  fieldName,
  baseFolder,
  subFolder,
  deleteExisting = false,
  collectionName,
  model,
}: MultiUploadOptions) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const files = (req.files as { [key: string]: Express.Multer.File[] })?.[
        fieldName
      ];

      if (!files || files.length === 0) {
        return next(
          new AppError(`No files found in field '${fieldName}'`, 400)
        );
      }

      // 🔄 Delete existing files if needed
      if (deleteExisting && collectionName && model) {
        let entityId =
          (req as any)?.[collectionName]?.id ||
          req?.params?.[`${collectionName}Id`] ||
          req?.body?.[`${collectionName}Id`];

        if (!entityId) {
          return next(
            new AppError(
              `Missing ${collectionName} ID for deletion lookup`,
              400
            )
          );
        }

        const existingDoc = await model.findById(entityId);

        if (!existingDoc) {
          return next(
            new AppError(`No ${collectionName} found with ID: ${entityId}`, 404)
          );
        }

        const existingFiles = existingDoc[fieldName];

        if (Array.isArray(existingFiles)) {
          const destroyPromises = existingFiles
            .filter((file) => file?.publicId)
            .map((file) => cloudinary.uploader.destroy(file.publicId));
          await Promise.all(destroyPromises);
        }
      }

      // ☁️ Upload new files
      const uploadedFiles = await uploadMultipleFilesToCloudinary(
        files,
        baseFolder,
        subFolder
      );

      req.body[fieldName] = uploadedFiles;
      next();
    } catch (err) {
      next(err);
    }
  };
};
