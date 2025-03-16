import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    ref_no: { type: String, trim: true },
    date: { type: Date },
    recipient_name: { type: String, trim: true },
    recipient_address: { type: String, trim: true },
    account_number: { type: String, trim: true },
    ifsc_code: { type: String, trim: true },
    amount: { type: Number },
    utr_no: { type: String, trim: true },
    transaction_date: { type: Date },
    invoices: [
      {
        invoice_no: { type: String, trim: true },
        invoice_date: { type: Date },
        rfd_id: { type: String, trim: true },
        rfd_date: { type: Date },
        gross_amount: { type: Number },
        tds: { type: Number },
        other_deductions: { type: Number },
        net_amount: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Incidents", incidentSchema);
