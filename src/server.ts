import "dotenv/config"; // Loads environment variables from .env
import mongoose from "mongoose";
import app from "./app";
import { connectDB } from "./config/database";
import logger from "./config/logger";

const PORT = process.env.PORT || 5000;

// Start server only after successful DB connection
const startServer = async () => {
  try {
    await connectDB(); // MongoDB connection

    const server = app.listen(PORT, () => {
      logger.info(
        `🚀 Server is running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`
      );
    });

    // Graceful Shutdown
    const shutdown = (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info("HTTP server closed.");
        mongoose.connection.close().then(() => {
          logger.info("MongoDB connection closed.");
          process.exit(0);
        });
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    logger.error("❌ Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
