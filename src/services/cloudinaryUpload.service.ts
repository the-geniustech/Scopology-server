import cloudinary from "@config/cloudinary.config";
import { v4 as uuidv4 } from "uuid";
import AppError from "@utils/appError";

export const uploadFileToCloudinary = async (
  fileBuffer: Buffer,
  folder: string = "uploads"
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: uuidv4(),
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

export const deleteFileFromCloudinary = async (
  publicId: string
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    throw new AppError("Cloudinary delete failed: " + error.message, 500);
  }
};
