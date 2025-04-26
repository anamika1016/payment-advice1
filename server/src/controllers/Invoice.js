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
    const { invoiceIndex, invoiceData, ...updateData } = req.body;
    const { company } = req.user;

    let updatedInvoice;

    // Case 1: Update a specific invoice by index in the payment
    if (invoiceIndex !== undefined && invoiceData) {
      // First find the payment document
      const payment = await PaymentInvoice.findById(id);

      if (!payment) {
        return res
          .status(404)
          .send({ success: false, message: "Payment not found" });
      }

      // Update the specific invoice at the given index
      if (payment.invoices && payment.invoices[invoiceIndex]) {
        payment.invoices[invoiceIndex] = {
          ...payment.invoices[invoiceIndex].toObject(),
          ...invoiceData,
        };

        updatedInvoice = await payment.save();
      } else {
        return res.status(404).send({
          success: false,
          message: "Invoice at specified index not found",
        });
      }
    }
    // Case 2: Update an invoice by its ID
    else if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // If id is a valid MongoDB ObjectID
      // First check if this is an invoice ID
      updatedInvoice = await PaymentInvoice.findOneAndUpdate(
        { "invoices._id": id, company },
        { $set: { "invoices.$": updateData } },
        { new: true }
      );

      // If not found as an invoice ID, try as a payment ID
      if (!updatedInvoice) {
        updatedInvoice = await PaymentInvoice.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true }
        );
      }
    }

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
    console.error("Error updating invoice:", error);
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
          // ✅ Set company name and address
          let companyName = "";
          let companyAddress = "";

          if (company === "asa") {
            companyName = "Action for Social Advancement (ASA)";
            companyAddress = `
                       "The Farmers House", Plan-C, Tulip Greens, Vill. Mahabadia, Kolar Road, Bhopal-462042, Madhya Pradesh<br>
                       Mobile No.: 9755295045<br>
                       Email: asa@asabhopal.org<br>
                       Website: www.asaindia.org
                     `;
          } else if (company === "papl") {
            companyName = "Ploughman Agro Private Limited";
            companyAddress = `
                       GOYAL DUPLEX NO. 04, GULMOHAR COLONY<br>
                       BEHIND SAVOY COMPLEX, BHOPAL<br>
                       MADHYA PRADESH 462039<br>
                       CIN: U01100MP2020PTC051052<br>
                       EMAIL: ploughmanagro@gmail.com
                     `;
          }

          // ✅ Replace placeholders
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
            .replace("[UTR Number]", paymentInvoice.utrNo || "N/A")
            .replace("[Company Name]", companyName)
            .replace("[Company Address]", companyAddress);

          const subject = `Payment Advice Approved successfully`;
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
          console.log("Sending SMS to phone:", targetInvoice.phone);

          // Calculate total amount from main invoice and all additional invoices
          let totalAmount = parseFloat(targetInvoice.netAmount) || 0;

          // Add amounts from additional invoices if they exist
          if (
            targetInvoice.additionalInvoices &&
            targetInvoice.additionalInvoices.length > 0
          ) {
            targetInvoice.additionalInvoices.forEach((addInv) => {
              totalAmount += parseFloat(addInv.netAmount) || 0;
            });
          }

          const invoiceNo = targetInvoice.invoiceNo || "N/A";
          const recipientName = targetInvoice.recipientName || "Client";

          const message = encodeURIComponent(
            `Dear ${recipientName}, payment of Rs. ${totalAmount.toFixed(
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
