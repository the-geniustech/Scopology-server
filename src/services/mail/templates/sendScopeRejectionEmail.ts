import { sendEmail } from "../index";
import { renderTemplate } from "../renderTemplate";

interface ScopeRejectionEmailOptions {
  clientEmail: string;
  clientName: string;
  scopeTitle: string;
  natureOfWork?: string;
  rejectionReason: string;
  rejectionMessage?: string;
}

export const sendScopeRejectionEmail = async ({
  clientEmail,
  clientName,
  scopeTitle,
  natureOfWork,
  rejectionReason,
  rejectionMessage,
}: ScopeRejectionEmailOptions): Promise<void> => {
  const html = await renderTemplate("scopeRejection", {
    clientName,
    scopeTitle,
    natureOfWork,
    rejectionReason,
    rejectionMessage,
    logoUrl:
      "https://res.cloudinary.com/dhngpbp2y/image/upload/v1745418384/Scopology_tpzklz.png",
    year: new Date().getFullYear(),
    primaryColor: "#FF5F20",
  });

  const payload = {
    to: clientEmail,
    subject: `Your Scope "${scopeTitle}" was rejected – Scopology`,
    html,
  };

  await sendEmail(payload);
};
