import mongoose from "mongoose";

const Companies = {
  PAPL: "papl",
  ASA: "asa",
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      default: 0,
    },
    company: {
      type: String,
      enum: Object.values(Companies),
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Users", userSchema);
