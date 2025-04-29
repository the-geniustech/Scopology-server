import { z } from "zod";
import { validate } from "@middlewares/validate.middleware";
import { ClientType } from "@interfaces/client.interface";

const clientTypeEnum = z.enum(
  [ClientType.INDUSTRIAL, ClientType.RESIDENTIAL, ClientType.COMMERCIAL],
  { message: "Invalid client type" }
);

export const createClientSchema = z.object({
  clientBusinessName: z
    .string()
    .min(2, { message: "Client BusinessName name is required" }),
  clientName: z.string().min(2, { message: "Client name is required" }),
  clientAddress: z.string().min(5, { message: "Client Address is required" }),
  clientContact: z.string().min(5, { message: "Client Contact is required" }),
  clientNatureOfBusiness: clientTypeEnum,
  clientBio: z
    .string()
    .min(5, { message: "About should not be less than 5 characters" })
    .max(500, { message: "About must be less than 500 characters" })
    .optional(),
});

const updateClientSchema = createClientSchema.partial();

export const validateCreateClient = validate(createClientSchema);
export const validateUpdateClient = validate(updateClientSchema);
