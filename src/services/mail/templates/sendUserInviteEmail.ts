import { renderTemplate } from "../renderTemplate";
import { sendEmail } from "../index";
import { EmailPayload } from "@interfaces/mail.interface";

interface InviteEmailOptions {
  user: {
    fullName: string;
    email: string;
    userId: string;
    roles: string[];
  };
  inviteLink: string;
  isResend?: boolean;
}

export const sendUserInviteEmail = async ({
  user,
  inviteLink,
  isResend = false,
}: InviteEmailOptions): Promise<void> => {
  const subject = isResend
    ? "Scopology Invitation – Resent"
    : "You’ve been invited to join Scopology";

  const html = await renderTemplate("invite", {
    fullName: user.fullName,
    roles: user.roles.join(", "),
    inviteLink,
    userId: user.userId,
    isResend,
    year: new Date().getFullYear(),
  });

  await sendEmail({
    to: user.email,
    subject,
    html,
  } as EmailPayload);
};
