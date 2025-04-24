import { z } from "zod";
import { validate } from "@middlewares/validate.middleware";

const inviteUserSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Valid email is required"),
  roles: z
    .array(z.enum(["administrator", "supervisor"]))
    .min(1, "At least one role must be assigned"),
});

const resendSchema = z.object({
  email: z.string().email(),
});

const acceptInviteSchema = z.object({
  token: z.string().min(10, "Invite token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const validateInviteUser = validate(inviteUserSchema);
export const validateResendInviteUser = validate(resendSchema);
export const validateAcceptInvite = validate(acceptInviteSchema);
