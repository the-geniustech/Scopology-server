import { ClientType } from "@interfaces/client.interface";
import { validate } from "@middlewares/validate.middleware";
import { z } from "zod";

export const createClientSchema = z.object({
  brandName: z.string().min(4, "Brand name is required"),
  name: z.string().min(2, "Name is required"),
  contact: z.string().email("A valid email is required"),
  natureOfBusiness: z.nativeEnum(ClientType),
});

export const validateUpdateClient = validate(createClientSchema);
