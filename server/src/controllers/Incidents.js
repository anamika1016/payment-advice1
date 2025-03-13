import mongoose from "mongoose";
import incidentModel from "../models/Incidents.js";

export const createIncident = async (req, res) => {
  try {
    const incident = new incidentModel({ ...req.body });

    const savedIncident = await incident.save();

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
