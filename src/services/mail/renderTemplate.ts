import fs from "fs-extra";
import path from "path";
import handlebars from "handlebars";

export const renderTemplate = async (
  templateName: string,
  data: Record<string, any>
): Promise<string> => {
  const filePath = path.join(
    __dirname,
    "templates",
    "views",
    `${templateName}.hbs`
  );
  const source = await fs.readFile(filePath, "utf8");
  const template = handlebars.compile(source);
  return template(data);
};
