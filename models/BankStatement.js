const mongoose = require("mongoose");

const BankStatementSchema = mongoose.Schema(
  {
    bank_name: {
      type: String,
      required: [true, "Enter Bank Name"],
    },
    loan_access_type: {
      type: String,
      required: [true, "Enter Loan Access Type"],
    },
    bank_file: {
      type: Buffer,
    },
    sixMonths: {
      type: Date,
      default: new Date(new Date().getTime() + 182 * 24 * 60 * 60 * 1000),
    },
    date: {
      type: Date,
      default: Date.now,
    },
    bankCreds: { type: Array, default: [] },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "Please Provide a Bank Statement "],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BankStatement", BankStatementSchema);
