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
      type: String,
      required: [true, "Enter Beneficiary File"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
