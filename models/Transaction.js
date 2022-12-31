const mongoose = require("mongoose");

const TransactionSchema = mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "Please Start a Transaction "],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
