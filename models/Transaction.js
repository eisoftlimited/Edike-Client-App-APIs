const mongoose = require("mongoose");

const TransactionSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "Please Start a Transaction "],
    },

    loan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loans",
    },
    reference: {
      type: String,
      required: [true, "Enter a Unique Reference "],
      unique: true,
    },
    payment_reference: {
      type: String,
      required: [true, "Enter a Reference "],
    },
    type: {
      type: String,
      required: [true, "Enter a platform of payment "],
    },
    amount: {
      type: Number,
      required: [true, "Enter Transaction Amount "],
    },
    status: {
      type: String,
      enum: ["pending", "failed", "success"],
      default: "pending",
    },
    description: {
      type: String,
      required: [true, "Enter a description for this Transaction "],
    },
    meta: {
      type: Object,
    },
    verified: {
      type: Boolean,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
