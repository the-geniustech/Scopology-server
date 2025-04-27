import { z } from "zod";
import { validate } from "@middlewares/validate.middleware";
import { ClientType } from "@interfaces/client.interface";

const clientTypeEnum = z.enum([
  ClientType.INDUSTRIAL,
  ClientType.RESIDENTIAL,
  ClientType.COMMERCIAL,
]);

const createClientSchema = z.object({
  brandName: z.string().min(2, { message: "Brand name is required" }),
  name: z.string().min(2, { message: "Client name is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  contact: z.string().min(5, { message: "Contact is required" }),
  natureOfBusiness: clientTypeEnum,
});

const updateClientSchema = createClientSchema.partial();

export const validateCreateClient = validate(createClientSchema);
export const validateUpdateClient = validate(updateClientSchema);
