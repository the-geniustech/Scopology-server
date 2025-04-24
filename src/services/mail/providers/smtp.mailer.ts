import nodemailer from "nodemailer";
import {
  EmailProvider,
  EmailPayload,
} from "../../../interfaces/mail.interface";
import dotenv from "dotenv";

dotenv.config();

export class SMTPMailer implements EmailProvider {
  private transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE || "gmail",
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async send(payload: EmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_USER}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
  }
}
