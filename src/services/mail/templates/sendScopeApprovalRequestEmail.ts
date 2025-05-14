import { renderTemplate } from "../renderTemplate";
import { sendEmail } from "../index";
import {
  ResendScopeApprovalOptions,
  ScopeApprovalOptions,
} from "@interfaces/scope.interface";

export const sendScopeApprovalRequestEmail = async ({
  admin,
  projectTitle,
  scopeTitle,
  acceptLink,
}: ScopeApprovalOptions): Promise<void> => {
  const subject = `Action Required: Accept Project Scope Invitation`;

  const html = await renderTemplate("ScopeApproval", {
    fullName: admin.fullName,
    projectTitle,
    scopeTitle,
    acceptLink,
    year: new Date().getFullYear(),
  });

  await sendEmail({ to: admin.email, subject, html });
};

export const resendScopeApprovalRequestEmail = async ({
  admin,
  projectTitle,
  scopeTitle,
  acceptLink,
}: ResendScopeApprovalOptions): Promise<void> => {
  const subject = `Reminder: Accept Your Project Scope Invitation`;

  const html = await renderTemplate("ScopeApproval", {
    fullName: admin.fullName,
    projectTitle,
    scopeTitle,
    acceptLink,
    year: new Date().getFullYear(),
  });

  await sendEmail({ to: admin.email, subject, html });
};
