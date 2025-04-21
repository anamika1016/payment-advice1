import PaymentInvoice from "../models/Invoice.js";
import { sendEmail } from "../utils/mailer.js";
import { pdfGenerate } from "../utils/pdfGenerator.js";
import util from "util";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import axios from "axios"; // Add this import for SMS functionality

export const createInvoice = async (req, res) => {
  try {
    const { company } = req.user;
    const invoiceData = { ...req.body, company };

    if (invoiceData.invoices && invoiceData.invoices.length > 0) {
      const refNos = invoiceData.invoices
        .map((inv) => inv.refNo)
        .filter(Boolean);
      const invoiceNos = invoiceData.invoices
        .map((inv) => inv.invoiceNo)
        .filter(Boolean);

      const hasDuplicateRefNos = new Set(refNos).size !== refNos.length;
      const hasDuplicateInvoiceNos =
        new Set(invoiceNos).size !== invoiceNos.length;

      if (hasDuplicateRefNos) {
        return res.status(400).send({
          success: false,
          message: "Duplicate reference numbers found in your submission",
        });
      }

      if (hasDuplicateInvoiceNos) {
        return res.status(400).send({
          success: false,
          message: "Duplicate invoice numbers found in your submission",
        });
      }

      for (const refNo of refNos) {
        if (refNo) {
          const existingRefNo = await PaymentInvoice.findOne({
            company,
            "invoices.refNo": refNo,
          });

          if (existingRefNo) {
            return res.status(400).send({
              success: false,
              message: `Reference Number '${refNo}' already exists in the database`,
            });
          }
        }
      }

      for (const invoiceNo of invoiceNos) {
        if (invoiceNo) {
          const existingInvoiceNo = await PaymentInvoice.findOne({
            company,
            "invoices.invoiceNo": invoiceNo,
          });

          if (existingInvoiceNo) {
            return res.status(400).send({
              success: false,
              message: `Invoice Number '${invoiceNo}' already exists in the database`,
            });
          }
        }
      }
    }

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
    const { company } = req.user;

    const invoices = await PaymentInvoice.find({ company });

    const allInvoices = invoices.flatMap((doc) =>
      doc.invoices.map((invoice) => {
        const invoiceObj = invoice.toObject ? invoice.toObject() : invoice;
        return {
          ...invoiceObj,
          utrNo: doc.utrNo,
        };
      })
    );

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
    const { status, invoiceHtml, sendSMS } = req.body;
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

    // Prepare responses
    let emailStatus = "not attempted";
    let smsStatus = "not attempted";

    if (status === "Approved") {
      // Send email if HTML is provided
      if (invoiceHtml) {
        try {
          if (!targetInvoice.recipientEmail) {
            throw new Error("Recipient email not found for this invoice.");
          }

          const readFile = util.promisify(fs.readFile);
          const __filename = fileURLToPath(import.meta.url);
          const __dirname = dirname(__filename);
          const emailTemplatePath = join(
            __dirname,
            "../templates/invoice.html"
          );

          let emailTemplate = await readFile(emailTemplatePath, "utf-8");
          emailTemplate = emailTemplate

            .replace(
              "[Recipient's Name]",
              targetInvoice.recipientName || "Customer"
            )
            .replace("[Invoice Number]", targetInvoice.invoiceNo || "N/A")
            .replace(
              "[Product/Service]",
              targetInvoice.productName || "Product/Service"
            )
            .replace(/\[Date\]/g, new Date().toLocaleDateString("en-IN"))
            .replace(
              "[Net Amount]",
              `₹${(targetInvoice.netAmount || 0).toFixed(2)}`
            )
            .replace("[Due Date]", targetInvoice.dueDate || "N/A")
            .replace("[Account Number]", targetInvoice.accountNumber || "N/A")
            .replace("[IFSC Code]", targetInvoice.ifscCode || "N/A")
            .replace("[UTR Number]", targetInvoice.utrNumber || "N/A");

          const subject = `Invoice #${
            targetInvoice.invoiceNo || ""
          } - Payment Approved successfully`;
          const pdfBuffer = await pdfGenerate(invoiceHtml);

          await sendEmail(
            targetInvoice.recipientEmail,
            subject,
            emailTemplate,
            pdfBuffer
          );

          emailStatus = "sent";
        } catch (emailError) {
          console.error("Email sending error:", emailError);
          emailStatus = `failed: ${emailError.message}`;
        }
      }

      // Send SMS if requested and phone number is available
      if (sendSMS && targetInvoice.phone) {
        try {
          // Log the phone number to verify its format
          console.log("Sending SMS to phone:", targetInvoice.phone);

          const amount = targetInvoice.netAmount || targetInvoice.amount || 0;
          const invoiceNo = targetInvoice.invoiceNo || "N/A";
          const recipientName = targetInvoice.recipientName || "Client";

          const message = encodeURIComponent(
            `Dear ${recipientName}, payment of Rs. ${amount.toFixed(
              2
            )}/- has been processed to your account against Invoice No: ${invoiceNo}. Kindly check and confirm receipt. Action For Social Advancement Finance Team`
          );

          const smsURL = `https://sms.yoursmsbox.com/api/sendhttp.php?authkey=3230666f72736131353261&mobiles=${targetInvoice.phone}&message=${message}&sender=ACTFSA&route=2&country=0&DLT_TE_ID=1707174435855270264`;

          console.log("SMS API URL:", smsURL);
          const smsResponse = await axios.get(smsURL);
          console.log("SMS API full response:", smsResponse);

          smsStatus = "sent";
        } catch (smsError) {
          console.error("SMS sending error details:", smsError);
          smsStatus = `failed: ${smsError.message}`;
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `Invoice status updated successfully. Email: ${emailStatus}. SMS: ${smsStatus}`,
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
