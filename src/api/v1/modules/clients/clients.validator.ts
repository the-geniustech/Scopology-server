import { z } from "zod";
import { validate } from "@middlewares/validate.middleware";
import { ClientType } from "@interfaces/client.interface";

const clientTypeEnum = z.enum(
  [ClientType.INDUSTRIAL, ClientType.RESIDENTIAL, ClientType.COMMERCIAL],
  { message: "Invalid client type" }
);

export const createClientSchema = z.object({
  clientName: z.string().min(1, { message: "Client name is required" }),
  clientAddress: z.string().min(5, { message: "Client Address is required" }),
  clientPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
    message: "Please provide a valid phone number",
  }),
  clientPurchaseNumber: z
    .string()
    .min(1, { message: "Client Purchase Number is required" }),
  clientEmail: z
    .string()
    .email({ message: "Please provide a valid email address" }),
  clientNature: clientTypeEnum,
  clientBio: z
    .string()
    .min(5, { message: "About should not be less than 5 characters" })
    .max(500, { message: "About must be less than 500 characters" })
    .optional(),
  clientLogo: z
    .object({
      publicId: z.string(),
      url: z.string(),
    })
    .optional(),
});

const updateClientSchema = createClientSchema.partial();

export const validateCreateClient = validate(createClientSchema);
export const validateUpdateClient = validate(updateClientSchema);
