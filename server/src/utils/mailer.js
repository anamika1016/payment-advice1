import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, html, pdfBuffer = null) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    if (pdfBuffer) {
      mailOptions.attachments = [
        {
          filename: "Payment_Advice.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ];
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Re-throw to allow proper error handling
  }
};