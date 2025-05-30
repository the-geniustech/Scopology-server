import { renderTemplate } from "../renderTemplate";
import { sendEmail } from "..";
import { SiteVisitRequestEmailOptions } from "@interfaces/siteVisit.interface";

export const sendSiteVisitRequestEmail = async ({
  clientName,
  clientRepresentativeName,
  contactMethod,
  siteVisitDate,
  siteVisitTime,
  projectTitle,
  adminEmail,
  dashboardUrl,
}: SiteVisitRequestEmailOptions): Promise<void> => {
  const html = await renderTemplate("siteVisitRequest", {
    clientName,
    clientRepresentativeName,
    contactMethod,
    siteVisitDate,
    siteVisitTime,
    projectTitle,
    dashboardUrl,
  });

  const payload = {
    to: adminEmail,
    subject: `New Site Visit Request for ${projectTitle}`,
    from: "Scopology <no-reply@scopology.app>",
    html,
  };

  await sendEmail(payload);
};
