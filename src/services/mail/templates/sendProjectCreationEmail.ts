import { sendEmail } from "../index";
import { renderTemplate } from "../renderTemplate";

export interface ProjectCreationEmailOptions {
  admin: { fullName: string; email: string };
  projectName: string;
  description?: string;
  createdBy: { fullName: string };
  projectId: string;
}

export const sendProjectCreationEmail = async ({
  admin,
  projectName,
  description = "No description provided.",
  createdBy,
  projectId,
}: ProjectCreationEmailOptions): Promise<void> => {
  const html = await renderTemplate("projectCreation", {
    adminName: admin.fullName,
    projectName,
    description,
    createdBy: createdBy.fullName,
    projectLink: `${process.env.APP_URL}/projects/${projectId}`,
    logoUrl:
      "https://res.cloudinary.com/dhngpbp2y/image/upload/v1745418384/Scopology_tpzklz.png",
    primaryColor: "#FF5F20",
    year: new Date().getFullYear(),
  });

  const payload = {
    to: admin.email,
    subject: `New Project Created – "${projectName}"`,
    html,
  };

  await sendEmail(payload);
};
