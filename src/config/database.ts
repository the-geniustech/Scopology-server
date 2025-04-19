import mongoose from "mongoose";
import logger from "./logger";
import { env } from "./env";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("❌ MongoDB connection error:", error);
    throw error;
  }
};
