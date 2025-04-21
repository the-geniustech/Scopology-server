import { EmailPayload } from "./mail.interface";
import { createMailer } from "./mailer.factory";

export const sendEmail = async (payload: EmailPayload): Promise<void> => {
  const mailer = createMailer();
  await mailer.send(payload);
};
