import { EmailPayload } from "@interfaces/mail.interface";
import { createMailer } from "./mailer.factory";

export const sendEmail = async (payload: EmailPayload): Promise<void> => {
  // console.log("sendEmail payload: ", payload);
  const mailer = createMailer();
  await mailer.send(payload);
};
