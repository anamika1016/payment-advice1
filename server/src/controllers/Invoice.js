import PaymentInvoice from "../models/Invoice.js";
import { sendEmail } from "../utils/mailer.js";
import { pdfGenerate } from "../utils/pdfGenerator.js";
import util from "util";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

export const createInvoice = async (req, res) => {
  try {
    // Get the company from the authenticated user
    const { company } = req.user;

    // Add company to the invoice data
    const invoiceData = {
      ...req.body,
      company,
    };

    const newInvoice = new PaymentInvoice(invoiceData);
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
    // Get the company from the authenticated user
    const { company } = req.user;

    // Filter invoices by company
    const invoices = await PaymentInvoice.find({ company }).select("invoices");

    const allInvoices = invoices.flatMap((doc) => doc.invoices);

    res.status(200).send({ success: true, data: allInvoices });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
};

export const editInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { company } = req.user;

    const updatedInvoice = await PaymentInvoice.findOneAndUpdate(
      { "invoices._id": id, company },
      { $set: { "invoices.$": updateData } },
      { new: true }
    );

    if (!updatedInvoice) {
      return res
        .status(404)
        .send({ success: false, message: "Invoice not found" });
    }

    res.status(200).send({
      success: true,
      message: "Invoice updated successfully",
      data: updatedInvoice,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to update invoice",
      error: error.message,
    });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { company } = req.user;

    const updatedInvoice = await PaymentInvoice.findOneAndUpdate(
      { "invoices._id": id, company },
      { $pull: { invoices: { _id: id } } },
      { new: true }
    );

    if (!updatedInvoice) {
      return res
        .status(404)
        .send({ success: false, message: "Invoice not found" });
    }

    res.status(200).send({
      success: true,
      message: "Invoice deleted successfully",
      data: updatedInvoice,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to delete invoice",
      error: error.message,
    });
  }
};

export const updateInvoiceStatus = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { status, invoiceHtml } = req.body;
    const { company } = req.user;

    if (!invoiceId) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID is required",
      });
    }

    const paymentInvoice = await PaymentInvoice.findOne({
      "invoices._id": invoiceId,
      company,
    });

    if (!paymentInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const targetInvoice = paymentInvoice.invoices.id(invoiceId);

    if (!targetInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found within the payment records",
      });
    }

    targetInvoice.status = status;
    await paymentInvoice.save();

    if (status === "Approved" && invoiceHtml) {
      try {
        if (!targetInvoice.recipientEmail) {
          throw new Error("Recipient email not found for this invoice.");
        }

        const readFile = util.promisify(fs.readFile);
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const emailTemplatePath = join(__dirname, "../templates/invoice.html");
        const emailTemplate = await readFile(emailTemplatePath, "utf-8");

        const subject = `Invoice #${
          targetInvoice.invoiceNo || "Invoice"
        } - Payment Approved`;
        const pdfBuffer = await pdfGenerate(invoiceHtml);

        await sendEmail(
          targetInvoice.recipientEmail,
          subject,
          emailTemplate,
          pdfBuffer
        );

        return res.status(200).json({
          success: true,
          message: "Invoice approved and email sent successfully",
          data: targetInvoice,
        });
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        return res.status(500).json({
          success: false,
          message: "Invoice updated but failed to send email",
          error: emailError.message,
          data: targetInvoice,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Invoice status updated successfully",
      data: targetInvoice,
    });
  } catch (error) {
    console.error("Error updating invoice status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update invoice status",
      error: error.message,
    });
  }
};
