import PaymentInvoice from "../models/Invoice.js";

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
    res
      .status(500)
      .send({
        success: false,
        message: "Failed to fetch invoices",
        error: error.message,
      });
  }
};