import PDFDocument from "pdfkit";
import fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

export const generatePdf = async (incidentId, userName, description) => {
  return new Promise((resolve, reject) => {
    try {
      const __dirname = dirname(fileURLToPath(import.meta.url));
      const pdfPath = join(__dirname, "../temp", `incident_${incidentId}.pdf`);

      // Ensure temp directory exists
      if (!fs.existsSync(dirname(pdfPath))) {
        fs.mkdirSync(dirname(pdfPath), { recursive: true });
      }

      const doc = new PDFDocument();
      const pdfStream = fs.createWriteStream(pdfPath);
      doc.pipe(pdfStream);

      // PDF Content
      doc.fontSize(20).text("Payment Advice", { align: "center" });
      doc.moveDown();
      doc.fontSize(14).text(`Dear ${userName},`);
      doc.moveDown();
      doc.text("This is your payment advice details for the reported incident.");
      doc.moveDown();
      doc.text(`Incident ID: ${incidentId}`);
      doc.text(`Incident Description: ${description || "No description provided"}`);
      doc.moveDown();
      doc.text("Thank you!");

      doc.end();

      pdfStream.on("finish", () => resolve(pdfPath));
      pdfStream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
};
