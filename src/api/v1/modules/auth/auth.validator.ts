import { z } from "zod";
import { validate } from "@middlewares/validate.middleware";

export const signupSuperAdminSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

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
});

export const revokeInviteSchema = z.object({
  email: z.string().email("A valid email is required"),
});
export const loginSchema = z.object({
  email: z.string().email("Email is required"),
  password: z.string().min(6, "Password is required"),
});

export const validateLogin = validate(loginSchema);
export const validateSignupSuperAdmin = validate(signupSuperAdminSchema);
export const validateRevokeInvite = validate(revokeInviteSchema);
export const validateInviteUser = validate(inviteUserSchema);
export const validateResendInviteUser = validate(resendSchema);
export const validateAcceptInvite = validate(acceptInviteSchema);
