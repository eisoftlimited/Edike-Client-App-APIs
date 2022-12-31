const mongoose = require("mongoose");

const CardSchema = mongoose.Schema(
  {
    card: {
      type: Array,
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
