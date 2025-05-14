import { generateICS } from "@utils/generateICS";
import { renderTemplate } from "../renderTemplate";
import { sendEmail } from "..";

export interface SiteVisitAcceptedEmailOptions {
  requestorEmail: string;
  requestorName: string;
  projectTitle?: string;
  siteVisitDate: Date;
  siteVisitTime: string;
  adminName: string;
  year: number;
}

export const sendSiteVisitAcceptedEmail = async ({
  requestorEmail,
  requestorName,
  projectTitle,
  siteVisitDate,
  siteVisitTime,
  adminName,
  year,
}: SiteVisitAcceptedEmailOptions): Promise<void> => {
  const visitDateObj = new Date(siteVisitDate);

  const html = await renderTemplate("siteVisitAccepted", {
    requestorName,
    projectTitle,
    siteVisitDate: visitDateObj.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    siteVisitTime,
    adminName,
    year,
  });

  const icsContent = await generateICS({
    title: `Site Visit: ${projectTitle}`,
    description: `Scheduled site visit for ${projectTitle} with Scopology.`,
    location: "Client Site (see project details)",
    start: siteVisitDate,
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
  };

  await sendEmail(payload);
};
