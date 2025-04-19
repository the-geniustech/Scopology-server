import { z } from "zod";
import dotenv from "dotenv";

dotenv.config(); // Load .env

// Schema validation using zod
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().url(),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid or missing environment variables:");
  console.error(parsedEnv.error.format());
  process.exit(1); // Exit the app if validation fails
}

export const env = parsedEnv.data;
