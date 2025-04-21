import { EmailProvider } from "./mail.interface";
import { SMTPMailer } from "./providers/smtp.mailer";
import { SendGridMailer } from "./providers/sendgrid.mailer";

export const createMailer = (): EmailProvider => {
  const provider = process.env.MAIL_PROVIDER;

  switch (provider) {
    case "sendgrid":
      return new SendGridMailer();
    default:
      return new SMTPMailer();
  }
};
