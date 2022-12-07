const mongoose = require("mongoose");

const BeneficiarySchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Enter a Firstname "],
    },
    lastname: {
      type: String,
      required: [true, "Enter a Lastname "],
    },
    school: {
      type: String,
      required: [true, "Enter School Name "],
    },
    studentClass: {
      type: String,
      required: [true, "Enter Student Class"],
    },
    gender: {
      type: String,
      required: [true, "Enter a Gender "],
    },
    dob: {
      type: String,
      required: [true, "Enter a Date of Birth "],
    },

    date: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please Provide a Beneficiary "],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Beneficiary", BeneficiarySchema);
