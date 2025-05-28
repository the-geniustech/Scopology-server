import path from "path";
import fs from "fs-extra";
import puppeteer from "puppeteer";
import handlebars from "handlebars";

export const renderPDF = async (
  templateName: string,
  data: Record<string, any>
): Promise<Buffer> => {
  try {
    const templatePath = path.join(
      __dirname,
      "templates",
      "views",
      `${templateName}.hbs`
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }
    console.log("Template path:", templatePath);

    const templateSource = await fs.readFile(templatePath, "utf8");
    console.log("Template source loaded successfully");
    const compiledTemplate = handlebars.compile(templateSource);
    console.log("Template compiled successfully");
    const html = compiledTemplate(data);
    console.log("HTML generated successfully");

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "30px", bottom: "30px", left: "30px", right: "30px" },
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  } catch (error: any) {
    console.error("PDF generation failed:", error.message);
    throw new Error("Failed to render PDF");
  }
};
