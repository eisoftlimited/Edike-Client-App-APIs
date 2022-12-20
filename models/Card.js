const mongoose = require("mongoose");

const CardSchema = mongoose.Schema(
  {
    card_type: {
      type: String,
      required: [true, "Enter Card Type"],
    },
    card_number: {
      type: Number,
      required: [true, "Enter a Card Number "],
    },
    card_holder: {
      type: String,
      required: [true, "Enter Your Card Name "],
    },
    expires_in: {
      type: Number,
      required: [true, "Enter ExpiresIn in M/Y "],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please Provide a Card "],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Card", CardSchema);
