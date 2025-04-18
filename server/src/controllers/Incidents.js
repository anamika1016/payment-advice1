import mongoose from "mongoose";
import incidentModel from "../models/Invoice.js";
import { sendEmail } from "../utils/mailer.js";
import util from "util";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { pdfGenerate } from "../utils/pdfGenerator.js";
import Services from "../models/Services.js";

export const createIncident = async (req, res) => {
  try {
    const incident = new incidentModel({ ...req.body });

    const savedIncident = await incident.save();

    try {
      const readFile = util.promisify(fs.readFile);
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const templatePath = join(__dirname, "../pdfs/invoice.html");
      const emailTemplatePath = join(
        __dirname,
        "../templates/paymentInvoicePdf.html"
      );
      const emailTemplate = await readFile(emailTemplatePath, "utf-8");

      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found at ${templatePath}`);
      }

      let template = await readFile(templatePath, "utf-8");

      let tableRows = "";
      for (const [key, value] of Object.entries(req.body)) {
        tableRows += `<tr><td>${key}</td><td>${value}</td></tr>`;
      }
      template = template.replace("${tableRows}", tableRows);

      const pdfBuffer = await pdfGenerate(template);

      await sendEmail(
        process.env.ADMIN_EMAIL,
        "Incident Report",
        emailTemplate,
        pdfBuffer
      );
    } catch (error) {
      console.error("Email error:", error);
    }

    res.status(201).send({
      success: true,
      message: "Incident created successfully",
      data: savedIncident,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Failed to create incident",
      error: error.message,
    });
  }
};

export const getAllIncidents = async (req, res) => {
  try {
    const incidents = await incidentModel.find();
    res.status(200).send({
      success: true,
      message: "Incidents fetched successfully",
      data: incidents,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching incidents",
      error: error.message,
    });
  }
};

export const getIncidentById = async (req, res) => {
  try {
    const incident = await incidentModel.findById(req.params.id);
    if (!incident) {
      return res
        .status(404)
        .send({ success: false, message: "Incident not found" });
    }
    res.status(200).send({
      success: true,
      message: "Incident fetched successfully",
      data: incident,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching incident",
      error: error.message,
    });
  }
};

export const updateIncident = async (req, res) => {
  try {
    const incidentData = { ...req.body };

    const incident = await incidentModel.findByIdAndUpdate(
      req.params.id,
      incidentData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!incident) {
      return res
        .status(404)
        .send({ success: false, message: "Incident not found" });
    }

    res.status(200).send({
      success: true,
      message: "Incident updated successfully",
      data: incident,
    });
  } catch (error) {
    res.status(400).send({
      success: true,
      message: "Error updating incident",
      error: error.message,
    });
  }
};

export const deleteIncident = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const incident = await incidentModel.findById(req.params.id);

    if (!incident) {
      return res.status(404).send({
        success: false,
        message: "Incident not found",
      });
    }

    const deletedIncident = await incidentModel.findByIdAndDelete(
      req.params.id,
      {
        session,
      }
    );

    await session.commitTransaction();

    res.status(200).send({
      success: true,
      message: "Incident deleted successfully",
      deletedIncident: deletedIncident,
      updatedOrganization: organization,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting incident",
      error: error.message,
    });
  }
};

export const getAllRecipients = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Recipient name is required as a query parameter",
      });
    }
    const nameRegex = new RegExp(`^${name}`, "i");
    const recipients = await Services.find({
      name: nameRegex,
    }).select("-__v");

    if (recipients.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No recipients found matching the name",
      });
    }

    res.status(200).json({
      success: true,
      message: "Recipients fetched successfully",
      data: recipients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching recipients",
      error: error.message,
    });
  }
};
