const mongoose = require("mongoose");

const LoanSchema = mongoose.Schema(
  {
    beneficiary_amount: {
      type: Number,
      required: [true, "Enter an Amount "],
    },
    beneficiary_duration: {
      type: Number,
      required: [true, "Enter Duration Period for Loan "],
    },
    beneficiary_file: {
      type: Buffer,
    },
    beneficiary_file_results: {
      type: Array,
    },
    date: {
      type: Date,
      default: Date.now,
    },
     status: {
      type: String,
      enum: [
        "pending",
        "ongoing",
        "pending_disbursement",
        "declined",
        "completed",
      ],
      default: "pending",
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
    beneficiaryDetails: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", LoanSchema);
