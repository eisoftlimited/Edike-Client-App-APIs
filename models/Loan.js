const mongoose = require("mongoose");

const LoanSchema = mongoose.Schema(
  {
    beneficiary_name: {
      type: String,
      required: [true, "Enter Beneficiary Name"],
    },
    beneficiary_amount: {
      type: Number,
      required: [true, "Enter an Amount "],
    },
    beneficiary_duration: {
      type: String,
      required: [true, "Enter Duration of Period "],
    },
    beneficiary_file: {
      type: Buffer,
      required: [true, "Enter School Bill Statement pdf"],
    },
    etag: {
      type: String,
    },
    signature: {
      type: String,
    },
    publicID: {
      type: String,
    },
    fileType: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ["ongoing", "pending", "declined", "completed"],
      default: "ongoing",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "Please Provide all Documents for Loan "],
    },
    beneficiaryFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Beneficiary",
      required: [true, "Please Provide a Beneficiary "],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", LoanSchema);
