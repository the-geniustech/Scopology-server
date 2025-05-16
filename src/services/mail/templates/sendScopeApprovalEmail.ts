import { sendEmail } from "../index";
import { renderTemplate } from "../renderTemplate";

export interface ScopeApprovalEmailOptions {
  admin: { fullName: string; email: string };
  clientName: string;
  clientEmail: string;
  scopeTitle: string;
  natureOfWork?: string;
  acceptLink: string;
}

export const sendScopeApprovalEmail = async ({
  clientName,
  clientEmail,
  natureOfWork,
  scopeTitle,
}: ScopeApprovalEmailOptions): Promise<void> => {
  const html = await renderTemplate("scopeApproval", {
    clientName,
    scopeTitle,
    natureOfWork,
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

  await sendEmail(payload);
};
