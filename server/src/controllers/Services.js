import serviceModel from "../models/Services.js";
import mongoose from "mongoose";
import xlsx from "xlsx";

export const createService = async (req, res) => {
  try {
    const service = new serviceModel({ ...req.body });

    const savedService = await service.save();

    res.status(201).send({
      success: true,
      message: "Service created successfully",
      data: savedService,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Failed to create service",
      error: error.message,
    });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const services = await serviceModel.find();
    res.status(200).send({
      success: true,
      message: "Services fetched successfully",
      data: services,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching services",
      error: error.message,
    });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await serviceModel.findById(req.params.id);
    if (!service) {
      return res
        .status(404)
        .send({ success: false, message: "Service not found" });
    }
    res.status(200).send({
      success: true,
      message: "Service fetched successfully",
      data: service,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching service",
      error: error.message,
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const serviceData = { ...req.body };

    const service = await serviceModel.findByIdAndUpdate(
      req.params.id,
      serviceData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!service) {
      return res
        .status(404)
        .send({ success: false, message: "Service not found" });
    }

    res.status(200).send({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (error) {
    res.status(400).send({
      success: true,
      message: "Error updating service",
      error: error.message,
    });
  }
};

export const deleteService = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const service = await serviceModel.findById(req.params.id);

    if (!service) {
      return res.status(404).send({
        success: false,
        message: "Service not found",
      });
    }

    const deletedService = await serviceModel.findByIdAndDelete(req.params.id, {
      session,
    });

    await session.commitTransaction();

    res.status(200).send({
      success: true,
      message: "Service deleted successfully",
      deletedService: deletedService,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting service",
      error: error.message,
    });
  }
};

export const bulkUploadServices = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({
        success: false,
        message: "Please upload a file",
      });
    }

    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype.includes("csv") ? "csv" : "xlsx";
    let jsonData;
    if (fileType === "csv") {
      const workbook = xlsx.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      const workbook = xlsx.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    }

    if (jsonData.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Uploaded file is empty or has no valid data",
      });
    }

    for (let i = 0; i < jsonData.length; i++) {
      const item = jsonData[i];
      if (!item.name || !item.email || !item.phone) {
        return res.status(400).send({
          success: false,
          message: `Row ${
            i + 1
          } is missing required fields (name, email, or phone)`,
        });
      }
    }
    const insertedData = await serviceModel.insertMany(jsonData);

    res.status(201).send({
      success: true,
      message: `${insertedData.length} services uploaded successfully`,
      data: insertedData,
    });
  } catch (error) {
    console.error("Error in bulk upload:", error);
    res.status(500).send({
      success: false,
      message: "Error processing file",
      error: error.message,
    });
  }
};
