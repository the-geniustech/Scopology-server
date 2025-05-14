import { z } from "zod";
import { validate } from "@middlewares/validate.middleware";

const updateUserProfileSchema = z.object({
  fullName: z.string().min(3).optional(),
  email: z.string().email().optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, {
      message:
        "Phone number must be in international format (e.g. +1234567890)",
    })
    .optional(),
  avatar: z
    .object({
      publicId: z.string(),
      url: z.string(),
    })
    .optional(),
});

const updateUserPasswordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
    confirmNewPassword: z.string().min(6),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords must match",
    path: ["confirmNewPassword"],
  });

export const validateUserProfileUpdate = validate(updateUserProfileSchema);
export const validateUserPasswordUpdate = validate(updateUserPasswordSchema);

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type UpdateUserPasswordInput = z.infer<typeof updateUserPasswordSchema>;
