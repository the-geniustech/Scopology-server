export interface EmailPayload {
  to: string;
  subject: string;
  html?: string;
  text: string;
}

export interface EmailProvider {
  send(payload: EmailPayload): Promise<void>;
}
