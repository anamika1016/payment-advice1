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

// Update invoice status and send email
export const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, invoiceHtml } = req.body;

    // Find the invoice
    const invoice = await PaymentInvoice.findById(id);

    if (!invoice) {
      return res.status(404).send({
        success: false,
        message: "Invoice not found",
      });
    }

    // Update status for all invoices in the payment
    for (let i = 0; i < invoice.invoices.length; i++) {
      invoice.invoices[i].status = status;
    }

    const updatedInvoice = await invoice.save();

    // If status is "Approved", send email with invoice
    if (status === "Approved" && invoiceHtml) {
      try {
        // Get all recipient emails
        const recipientEmails = invoice.invoices.map(
          (inv) => inv.recipientEmail
        );

        // Create a subject line using invoice number if available
        const subject = `Invoice #${
          invoice.invoices[0]?.invoiceNo || "Invoice"
        } - Payment Approved`;

        // Generate PDF buffer if needed (you might need to implement this part)
        const pdfBuffer = await generateInvoicePdf(invoiceHtml, invoice);

        // Send email to all recipients
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

// Helper function to generate PDF from HTML (implement based on your requirements)
const generateInvoicePdf = async (invoiceHtml, invoice) => {
  // You can use libraries like html-pdf, puppeteer, or jspdf to convert HTML to PDF
  // This is a placeholder function - implement based on your requirements

  // Example implementation (uncomment and adapt as needed):
  /*
  import puppeteer from 'puppeteer';
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(invoiceHtml);
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();
  return pdfBuffer;
  */

  // For now, return null if you don't need PDF attachment
  return null;
};
