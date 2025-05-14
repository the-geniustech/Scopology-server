export interface EmailPayload {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string;
  bcc?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
  headers?: Record<string, string>;
}

export interface EmailProvider {
  send(payload: EmailPayload): Promise<void>;
}
