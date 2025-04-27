import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().url(),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string(),
  CLIENT_APP_URL: z.string().url(),
  SUPERADMIN_SETUP_SECRET: z.string().min(10),
  CLOUDINARY_CLOUD_NAME: z.string().min(2),
  CLOUDINARY_API_KEY: z.string().min(2),
  CLOUDINARY_API_SECRET: z.string().min(2),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid or missing environment variables:");
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
