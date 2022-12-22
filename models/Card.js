const mongoose = require("mongoose");

const CardSchema = mongoose.Schema(
  {
    card_type: {
      type: String,
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
      type: String,
      required: [true, "Enter ExpiresIn in M/Y "],
    },
    cvc: {
      type: Number,
      required: [true, "Enter ExpiresIn in CVC "],
    },
    bin: {
      type: String,
    },
    brand: {
      type: String,
    },
    country_code: {
      type: String,
    },
    country_name: {
      type: String,
    },
    country_code: {
      type: String,
    },
    bank: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "Please Provide a Card "],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Card", CardSchema);
