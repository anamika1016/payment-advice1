import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required"],
    },
    phone: {
      type: String,
      trim: true,
      required: [true, "Phone number is required"],
    },
    bankName: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    ifscCode: {
      type: String,
      trim: true,
    },
    bankAddress: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      trim: true,
      enum: ["company", "employee"],
    },
    company: {
      type: String,
      enum: ["asa", "papl"],
      required: [true, "Company is required"],
    },
  },
  { timestamps: true }
);

// Custom error handler for duplicate key errors
serviceSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    let customMessage;

    switch (field) {
      case "email":
        customMessage = "Email address is already registered";
        break;
      case "phone":
        customMessage = "Phone number is already registered";
        break;
      case "accountNumber":
        customMessage = "Account number is already registered";
        break;
      default:
        customMessage = `${field} already exists`;
    }

    next(new Error(customMessage));
  } else {
    next(error);
  }
});

// Validate based on company scope
serviceSchema.index({ email: 1, company: 1 }, { unique: true });
serviceSchema.index({ phone: 1, company: 1 }, { unique: true });
serviceSchema.index({ accountNumber: 1, company: 1 }, { unique: true });

const Service = mongoose.model("Services", serviceSchema);

export default Service;
