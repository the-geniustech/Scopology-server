import { sendEmail } from "../index";
import { renderTemplate } from "../renderTemplate";
import { EmailPayload } from "@interfaces/mail.interface";

interface ResetPasswordEmailOptions {
  to: string;
  fullName: string;
  resetLink: string;
}

export const sendResetPasswordEmail = async ({
  to,
  fullName,
  resetLink,
}: ResetPasswordEmailOptions) => {
  const html = await renderTemplate("resetPassword", {
    fullName,
    resetLink,
    year: new Date().getFullYear(),
    logoUrl:
      "https://res.cloudinary.com/dhngpbp2y/image/upload/v1745418384/Scopology_tpzklz.png",
    primaryColor: "#FF5F20",
  });

  const payload: EmailPayload = {
    to,
    subject: "Reset Your Scopology Password",
    html,
  };

  await sendEmail(payload);
};
