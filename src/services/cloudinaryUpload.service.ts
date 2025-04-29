import cloudinary from "@config/cloudinary.config";
import AppError from "@utils/appError";

export const uploadSingleFileToCloudinary = (
  fileBuffer: Buffer,
  baseFolder: string,
  subFolder?: string
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const fullFolderPath = subFolder
      ? `${baseFolder}/${subFolder}`
      : `${baseFolder}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: fullFolderPath,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          return reject(
            new AppError("Cloudinary upload failed: " + error.message, 500)
          );
        }
        if (!result?.secure_url || !result?.public_id) {
          return reject(
            new AppError("Invalid Cloudinary upload response", 500)
          );
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(fileBuffer);
  });
};

export const uploadMultipleFilesToCloudinary = async (
  files: Express.Multer.File[],
  baseFolder: string,
  subFolder?: string
): Promise<{ url: string; publicId: string }[]> => {
  if (!files || files.length === 0) {
    throw new AppError("No files provided for upload", 400);
  }

  const uploadPromises = files.map((file) =>
    uploadSingleFileToCloudinary(file.buffer, baseFolder, subFolder)
  );

  const uploadedFiles = await Promise.all(uploadPromises);

  return uploadedFiles;
};

export const deleteFileFromCloudinary = async (
  publicId: string
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    throw new AppError("Cloudinary delete failed: " + error.message, 500);
  }
};

export const deleteMultipleFilesFromCloudinary = async (
  publicIds: string[]
): Promise<void> => {
  if (!publicIds || publicIds.length === 0) {
    throw new AppError("No public IDs provided for deletion", 400);
  }

  try {
    const deletePromises = publicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId)
    );
    await Promise.all(deletePromises);
  } catch (error: any) {
    throw new AppError(
      "Batch deletion from Cloudinary failed: " + error.message,
      500
    );
  }
};

export const deleteFolderFromCloudinary = async (
  folderPath: string
): Promise<void> => {
  if (!folderPath) {
    throw new AppError("Folder path is required for deletion", 400);
  }

  try {
    const { deleted } = await cloudinary.api.delete_resources_by_prefix(
      folderPath
    );

    if (Object.keys(deleted).length === 0) {
      throw new AppError(`No resources found under folder: ${folderPath}`, 404);
    }
  } catch (error: any) {
    throw new AppError(
      "Failed to delete folder from Cloudinary: " + error.message,
      500
    );
  }
};
