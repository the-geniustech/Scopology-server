import { renderTemplate } from "../renderTemplate";
import { sendEmail } from "../index";
import { EmailPayload } from "@interfaces/mail.interface";
import {
  ResendScopeInviteOptions,
  ScopeInviteOptions,
} from "@interfaces/scope.interface";

export const sendScopeInviteEmail = async ({
  admin,
  projectTitle,
  scopeTitle,
  acceptLink,
}: ScopeInviteOptions): Promise<void> => {
  const subject = `Action Required: Accept Project Scope Invitation`;

  const html = await renderTemplate("scopeInvite", {
    fullName: admin.fullName,
    projectTitle,
    scopeTitle,
    acceptLink,
    year: new Date().getFullYear(),
  });

  await sendEmail({
    to: admin.email,
    subject,
    html,
  } as EmailPayload);
};

export const resendScopeInviteEmail = async ({
  admin,
  projectTitle,
  scopeTitle,
  acceptLink,
}: ResendScopeInviteOptions): Promise<void> => {
  const subject = `Reminder: Accept Your Project Scope Invitation`;

  const html = await renderTemplate("scopeInvite", {
    fullName: admin.fullName,
    projectTitle,
    scopeTitle,
    acceptLink,
    year: new Date().getFullYear(),
  });

  await sendEmail({
    to: admin.email,
    subject,
    html,
  } as EmailPayload);
};
