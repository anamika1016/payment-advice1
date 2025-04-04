import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifscCode: { type: String, trim: true },
    bankAddress: { type: String, trim: true },
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    type: { type: String, trim: true },
    company: {
      type: String,
      enum: ["asa", "papl"],
      required: true
    },
  },
  { timestamps: true }
);

export default mongoose.model("Services", serviceSchema);
