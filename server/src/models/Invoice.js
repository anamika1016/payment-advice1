import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  refNo: {
    type: String,
    trim: true,
    index: true, // Added for optimization of lookups
  },
  recipientName: { type: String, trim: true, required: true },
  recipientEmail: { type: String, trim: true, required: true },
  recipientAddress: { type: String, trim: true },
  phone: { type: String, trim: true },
  accountNumber: { type: String, trim: true, required: true },
  ifscCode: { type: String, trim: true, required: true },
  date: { type: Date},
  status: {
    type: String,
    enum: ["Approved", "Pending", "Rejected"],
    default: "Pending",
  },
  invoiceNo: {
    type: String,
    trim: true,
    index: true, // Added for optimization of lookups
  },
  invoiceDate: { type: Date },
  grossAmount: { type: Number },
  tds: { type: Number },
  otherDeductions: { type: Number },
  netAmount: { type: Number },
  particulars: { type: String, trim: true },
  // Add this new field for additional invoices
  additionalInvoices: [
    {
      invoiceNo: { type: String, trim: true },
      invoiceDate: { type: Date },
      particulars: { type: String, trim: true },
      grossAmount: { type: Number },
      tds: { type: Number },
      otherDeductions: { type: Number },
      netAmount: { type: Number },
    },
  ],
});

const PaymentInvoiceSchema = new mongoose.Schema({
  paymentType: { type: String, enum: ["nft", "upi"], required: true },
  utrNo: { type: String, trim: true, required: true },
  bankName: { type: String },
  senderAccountNumber: { type: String },
  amount: { type: Number },
  transactionDate: { type: Date, required: true },
  invoices: { type: [InvoiceSchema], required: true },
  company: {
    type: String,
    enum: ["asa", "papl"],
    required: true,
  },
});

const PaymentInvoice = mongoose.model("PaymentInvoice", PaymentInvoiceSchema);

export default PaymentInvoice;
