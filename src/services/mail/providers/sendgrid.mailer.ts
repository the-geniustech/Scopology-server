import sgMail from "@sendgrid/mail";
import { EmailProvider, EmailPayload } from "@interfaces/mail.interface";
import dotenv from "dotenv";

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export class SendGridMailer implements EmailProvider {
  async send(payload: EmailPayload): Promise<void> {
    await sgMail.send({
      to: payload.to,
      from: process.env.MAIL_FROM_ADDRESS!,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
  }
}
