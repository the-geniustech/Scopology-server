import { generateICS } from "@utils/generateICS";
import { EmailPayload } from "@interfaces/mail.interface";
import { renderTemplate } from "../renderTemplate";
import { sendEmail } from "..";

export interface SiteVisitAcceptedEmailOptions {
  requestorEmail: string;
  requestorName: string;
  projectTitle: string;
  siteVisitDate: string;
  siteVisitTime: string;
  adminName: string;
  siteVisitAt: Date;
  year: number;
}

export const sendSiteVisitAcceptedEmail = async ({
  requestorEmail,
  requestorName,
  projectTitle,
  siteVisitDate,
  siteVisitTime,
  adminName,
  siteVisitAt,
  year,
}: SiteVisitAcceptedEmailOptions): Promise<void> => {
  const html = await renderTemplate("siteVisitAccepted", {
    requestorName,
    projectTitle,
    siteVisitDate,
    siteVisitTime,
    adminName,
    year,
  });

  // 🧠 Generate ICS string
  const icsContent = await generateICS({
    title: `Site Visit: ${projectTitle}`,
    description: `Scheduled site visit for ${projectTitle} with Scopology.`,
    location: "Client Site (see project details)",
    start: siteVisitAt,
    durationMinutes: 60,
    organizer: {
      name: "Scopology Admin",
      email: "no-reply@scopology.app",
    },
  });

  const payload = {
    to: requestorEmail,
    subject: `Your site visit has been accepted`,
    from: "Scopology <no-reply@scopology.app>",
    html,
    attachments: [
      {
        filename: "site-visit.ics",
        content: icsContent,
        contentType: "text/calendar",
      },
    ],
  } as EmailPayload;

  await sendEmail(payload);
};
