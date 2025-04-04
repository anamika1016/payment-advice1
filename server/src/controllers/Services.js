import serviceModel from "../models/Services.js";
import mongoose from "mongoose";
import xlsx from "xlsx";

export const createService = async (req, res) => {
  try {
    const { company } = req.user;

    // Add company to the service data
    const serviceData = {
      ...req.body,
      company, // Use company field only
    };

    const newService = new serviceModel(serviceData);
    const savedService = await newService.save();

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
    const { company } = req.user;

    // Filter services by company
    const services = await serviceModel.find({ company });

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
    const { company } = req.user;

    // Find service by ID and ensure it belongs to the user's company
    const service = await serviceModel.findOne({
      _id: req.params.id,
      company,
    });

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
    const { company } = req.user;
    const serviceData = { ...req.body };

    // Prevent changing the company of the service
    delete serviceData.company;

    // Update while ensuring the service belongs to the user's company
    const service = await serviceModel.findOneAndUpdate(
      { _id: req.params.id, company },
      serviceData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!service) {
      return res.status(404).send({
        success: false,
        message: "Service not found or you don't have permission to update it",
      });
    }

    res.status(200).send({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error updating service",
      error: error.message,
    });
  }
};

export const deleteService = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { company } = req.user;

    session.startTransaction();

    // Find the service and verify it belongs to the user's company
    const service = await serviceModel.findOne({
      _id: req.params.id,
      company,
    });

    if (!service) {
      await session.abortTransaction();
      return res.status(404).send({
        success: false,
        message: "Service not found or you don't have permission to delete it",
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
    await session.abortTransaction();
    res.status(500).send({
      success: false,
      message: "Error deleting service",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

export const bulkUploadServices = async (req, res) => {
  try {
    const { company } = req.user;

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

    // Validate and add company to each record
    const processedData = [];
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

      // Add company field to each record
      processedData.push({
        ...item,
        company,
      });
    }

    const insertedData = await serviceModel.insertMany(processedData);

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
