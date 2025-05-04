import { sendEmail } from "../index";
import { renderTemplate } from "../renderTemplate";
import { EmailPayload } from "@interfaces/mail.interface";

export interface ScopeApprovalEmailOptions {
  admin: { fullName: string; email: string };
  clientName: string;
  clientEmail: string;
  scopeTitle: string;
  projectTitle: string;
  acceptLink: string;
}

export const sendScopeApprovalEmail = async ({
  clientName,
  clientEmail,
  projectTitle,
  scopeTitle,
}: ScopeApprovalEmailOptions): Promise<void> => {
  const html = await renderTemplate("scopeApproval", {
    clientName,
    scopeTitle,
    projectTitle,
    logoUrl:
      "https://res.cloudinary.com/dhngpbp2y/image/upload/v1745418384/Scopology_tpzklz.png",
    year: new Date().getFullYear(),
    primaryColor: "#FF5F20",
  });

  const payload = {
    to: clientEmail,
    subject: `Your Scope "${scopeTitle}" was approved – Scopology`,
    html,
  };

  await sendEmail(payload as EmailPayload);
};
