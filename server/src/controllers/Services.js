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

    // Check for existing service with same email
    const existingEmail = await serviceModel.findOne({
      email: serviceData.email,
      company,
    });

    if (existingEmail) {
      return res.status(400).send({
        success: false,
        message: "Email address is already registered",
      });
    }

    // Check for existing service with same phone
    const existingPhone = await serviceModel.findOne({
      phone: serviceData.phone,
      company,
    });

    if (existingPhone) {
      return res.status(400).send({
        success: false,
        message: "Phone number is already registered",
      });
    }

    // Check for existing service with same account number if provided
    if (serviceData.accountNumber) {
      const existingAccount = await serviceModel.findOne({
        accountNumber: serviceData.accountNumber,
        company,
      });

      if (existingAccount) {
        return res.status(400).send({
          success: false,
          message: "Account number is already registered",
        });
      }
    }

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
    const serviceId = req.params.id;

    // Prevent changing the company of the service
    delete serviceData.company;

    // Check for existing service with same email (excluding current service)
    if (serviceData.email) {
      const existingEmail = await serviceModel.findOne({
        email: serviceData.email,
        company,
        _id: { $ne: serviceId },
      });

      if (existingEmail) {
        return res.status(400).send({
          success: false,
          message: "Email address is already registered",
        });
      }
    }

    // Check for existing service with same phone (excluding current service)
    if (serviceData.phone) {
      const existingPhone = await serviceModel.findOne({
        phone: serviceData.phone,
        company,
        _id: { $ne: serviceId },
      });

      if (existingPhone) {
        return res.status(400).send({
          success: false,
          message: "Phone number is already registered",
        });
      }
    }

    // Check for existing service with same account number if provided (excluding current service)
    if (serviceData.accountNumber) {
      const existingAccount = await serviceModel.findOne({
        accountNumber: serviceData.accountNumber,
        company,
        _id: { $ne: serviceId },
      });

      if (existingAccount) {
        return res.status(400).send({
          success: false,
          message: "Account number is already registered",
        });
      }
    }

    // Update while ensuring the service belongs to the user's company
    const service = await serviceModel.findOneAndUpdate(
      { _id: serviceId, company },
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
    const errors = [];

    // First pass - validation check
    for (let i = 0; i < jsonData.length; i++) {
      const item = jsonData[i];
      const rowNum = i + 1;

      if (!item.name || !item.email || !item.phone) {
        errors.push(
          `Row ${rowNum} is missing required fields (name, email, or phone)`
        );
        continue;
      }

      // Check for duplicates within the file
      const duplicateInFile = processedData.find(
        (service) =>
          service.email === item.email ||
          service.phone === item.phone ||
          (item.accountNumber && service.accountNumber === item.accountNumber)
      );

      if (duplicateInFile) {
        errors.push(
          `Row ${rowNum} contains duplicate email, phone or account number`
        );
        continue;
      }

      // Check for existing records in database
      const existingEmail = await serviceModel.findOne({
        email: item.email,
        company,
      });
      if (existingEmail) {
        errors.push(
          `Row ${rowNum}: Email "${item.email}" is already registered`
        );
        continue;
      }

      const existingPhone = await serviceModel.findOne({
        phone: item.phone,
        company,
      });
      if (existingPhone) {
        errors.push(
          `Row ${rowNum}: Phone "${item.phone}" is already registered`
        );
        continue;
      }

      if (item.accountNumber) {
        const existingAccount = await serviceModel.findOne({
          accountNumber: item.accountNumber,
          company,
        });
        if (existingAccount) {
          errors.push(
            `Row ${rowNum}: Account number "${item.accountNumber}" is already registered`
          );
          continue;
        }
      }

      // Add company field to valid record
      processedData.push({
        ...item,
        company,
      });
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return res.status(400).send({
        success: false,
        message: "Validation errors in uploaded file",
        errors: errors,
      });
    }

    // If validation passes, insert data
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
