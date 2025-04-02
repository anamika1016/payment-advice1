import PaymentInvoice from "../models/Invoice.js";
import { sendEmail } from "../utils/mailer.js";

export const createInvoice = async (req, res) => {
  try {
    const newInvoice = new PaymentInvoice(req.body);
    const savedInvoice = await newInvoice.save();
    res.status(201).send({
      success: true,
      message: "Invoice created successfully",
      data: savedInvoice,
    });
  } catch (error) {
    console.error("Invoice error:", error);
    res.status(400).send({
      success: false,
      message: "Failed to create invoice",
      error: error.message,
    });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await PaymentInvoice.find();
    res.status(200).send({ success: true, data: invoices });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
};

export const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, invoiceHtml } = req.body;

    const invoice = await PaymentInvoice.findById(id);

    if (!invoice) {
      return res.status(404).send({
        success: false,
        message: "Invoice not found",
      });
    }

    for (let i = 0; i < invoice.invoices.length; i++) {
      invoice.invoices[i].status = status;
    }

    const updatedInvoice = await invoice.save();

    if (status === "Approved" && invoiceHtml) {
      try {
        const recipientEmails = invoice.invoices.map(
          (inv) => inv.recipientEmail
        );

        const subject = `Invoice #${
          invoice.invoices[0]?.invoiceNo || "Invoice"
        } - Payment Approved`;

        const pdfBuffer = await generateInvoicePdf(invoiceHtml, invoice);

        await sendEmail(
          recipientEmails.join(", "),
          subject,
          invoiceHtml,
          pdfBuffer
        );

        res.status(200).send({
          success: true,
          message: "Invoice approved and email sent",
          data: updatedInvoice,
        });
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        res.status(500).send({
          success: false,
          message: "Invoice updated but failed to send email",
          error: emailError.message,
          data: updatedInvoice,
        });
      }
    } else {
      res.status(200).send({
        success: true,
        message: "Invoice status updated",
        data: updatedInvoice,
      });
    }
  } catch (error) {
    console.error("Update invoice status error:", error);
    res.status(500).send({
      success: false,
      message: "Failed to update invoice status",
      error: error.message,
    });
  }
};

export const generateInvoicePdf = async (invoice) => {
  try {
    // Get file system module
    const fs = await import("fs");
    const path = await import("path");

    // Read the HTML template
    const templatePath = path.default.resolve("./public/pdf/template.html");
    let html = fs.default.readFileSync(templatePath, "utf8");

    // Format the current date
    const today = new Date();
    const formattedDate = today
      .toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");

    // Get the first invoice item (assuming there's at least one)
    const invoiceItem = invoice.invoices[0] || {};

    // Calculate totals
    const totalGrossAmount = invoice.invoices.reduce(
      (sum, inv) => sum + Number(inv.grossAmount || 0),
      0
    );
    const totalTds = invoice.invoices.reduce(
      (sum, inv) => sum + Number(inv.tds || 0),
      0
    );
    const totalOtherDeductions = invoice.invoices.reduce(
      (sum, inv) => sum + Number(inv.otherDeductions || 0),
      0
    );
    const totalNetAmount = invoice.invoices.reduce(
      (sum, inv) => sum + Number(inv.netAmount || 0),
      0
    );

    // Replace placeholders in the template
    html = html
      // Header information
      .replace("<p>Date</p>", `<p>Date: ${formattedDate}</p>`)
      .replace(
        "<p>Ref No.<br></p>",
        `<p>Ref No.: ${invoiceItem.refNo || "-"}<br></p>`
      )
      .replace(
        "<p>To,<br></p>",
        `<p>To,<br>${invoiceItem.recipientName || ""}<br>${
          invoiceItem.recipientAddress || ""
        }</p>`
      )

      // Payment details
      .replace("Rs. ------------------", `Rs. ${totalNetAmount.toFixed(2)}`)
      .replace(
        "Account No.------------------",
        `Account No. ${invoiceItem.accountNumber || "-"}`
      )
      .replace(
        "IFSC Code ---------------",
        `IFSC Code ${invoiceItem.ifscCode || "-"}`
      )
      .replace(
        "UTR No.---------------------",
        `UTR No. ${invoiceItem.utrNo || "-"}`
      )
      .replace(
        "dated -------------",
        `dated ${invoiceItem.invoiceDate || formattedDate}`
      );

    // Generate table rows dynamically
    let tableRows = "";
    invoice.invoices.forEach((inv) => {
      tableRows += `
        <tr>
          <td>${inv.particulars || "-"}</td>
          <td>${inv.invoiceNo || "-"}<br>${inv.invoiceDate || "-"}</td>
          <td>${inv.rfdId || "-"}<br>${inv.rfdDate || "-"}</td>
          <td>₹${Number(inv.grossAmount || 0).toFixed(2)}</td>
          <td>₹${Number(inv.tds || 0).toFixed(2)}</td>
          <td>₹${Number(inv.otherDeductions || 0).toFixed(2)}</td>
          <td>₹${Number(inv.netAmount || 0).toFixed(2)}</td>
        </tr>
      `;
    });

    // Add empty rows if needed (to ensure we have at least 4 rows total)
    const emptyRowsNeeded = Math.max(0, 4 - invoice.invoices.length);
    for (let i = 0; i < emptyRowsNeeded; i++) {
      tableRows += `
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      `;
    }

    // Add totals row
    tableRows += `
      <tr>
        <th>TOTAL</th>
        <td></td>
        <td></td>
        <td>₹${totalGrossAmount.toFixed(2)}</td>
        <td>₹${totalTds.toFixed(2)}</td>
        <td>₹${totalOtherDeductions.toFixed(2)}</td>
        <td>₹${totalNetAmount.toFixed(2)}</td>
      </tr>
    `;

    // Replace the table rows in the template
    html = html.replace(
      /<tr>\s*<td><\/td>\s*<td><\/td>\s*<td><\/td>\s*<td><\/td>\s*<td><\/td>\s*<td><\/td>\s*(<td><\/td>)?\s*<\/tr>(\s*<tr>\s*<td><\/td>\s*<td><\/td>\s*<td><\/td>\s*<td><\/td>\s*<td><\/td>\s*<td><\/td>\s*(<td><\/td>)?\s*<\/tr>)*\s*<tr>\s*<th>TOTAL<\/th>\s*<td><\/td>\s*<td><\/td>\s*<td><\/td>\s*<td><\/td>\s*<td><\/td>\s*(<td><\/td>)?\s*<\/tr>/s,
      tableRows
    );

    // Launch a headless browser to render the HTML
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Set the HTML content
    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        right: "10mm",
        bottom: "10mm",
        left: "10mm",
      },
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF: " + error.message);
  }
};
