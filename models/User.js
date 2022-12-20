const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Enter your Firstname"],
    },
    lastname: {
      type: String,
      required: [true, "Enter your Lastname"],
    },
    middlename: {
      type: String,
      required: [true, "Enter your Middle Name"],
    },
    nationality: {
      type: String,
      required: [true, "Enter your Nationality"],
    },
    email: {
      type: String,
      required: [true, "Enter your Email Address"],
      match: [
        /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
        "Enter a Valid Email Address",
      ],
      unique: true,
    },
    phone: {
      type: Number,
      required: [true, "Enter your Phone Number"],
      minlength: 4,
      maxlength: 11,
    },

    password: {
      type: String,
      required: [true, "Enter your Password"],
      minlength: 6,
    },
    bvn: {
      type: String,
      required: [true, "Enter your BVN Number"],
    },
    nin: {
      type: String,
      required: [true, "Enter your NIN Number"],
    },
    profileImage: {
      type: String,
      data: Buffer,
      contentType: String,
    },
    otpToken: {
      type: Number,
    },
    isAccountVerified: {
      type: String,
    },
    resetPasswordToken: {
      type: Number,
      required: false,
    },
    maidenname: {
      type: String,
      required: [true, "Enter your Maiden's Name"],
    },
    self_origin_lga: {
      type: String,
      required: [true, "Enter your Local Govt"],
    },
    self_origin_place: {
      type: String,
      required: [true, "Enter your House Address"],
    },
    self_origin_state: {
      type: String,
      required: [true, "Enter your State of Origin"],
    },
    birthdate: {
      type: String,
      required: [true, "Enter your Birth Date"],
    },
    religion: {
      type: String,
      required: [true, "Enter your Religion"],
    },
    gender: {
      type: String,
      required: [true, "Enter your Gender"],
    },
    nok_firstname: {
      type: String,
      required: [true, "Enter your Next of Kin's First Name"],
    },
    nok_lastname: {
      type: String,
      required: [true, "Enter your Next of Kin's Last Name"],
    },
    nok_middename: {
      type: String,
      required: [true, "Enter your Next of Kin's Middle Name"],
    },
    nok_address: {
      type: String,
      required: [true, "Enter your Next of Kin's Address"],
    },
    nok_lga: {
      type: String,
      required: [true, "Enter your Next of Kin's Local Govt"],
    },
    nok_state: {
      type: String,
      required: [true, "Enter your Next of Kin's State of Origin"],
    },
    nok_town: {
      type: String,
      required: [true, "Enter your Next of Kin's Town"],
    },
  },
  { timestamps: true }
);

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, email: this.email },
    process.env.JWTSECRET,
    {
      expiresIn: process.env.JWTLIFETIME,
    }
  );
};

UserSchema.methods.comparePassword = async function (userpassword) {
  const isMatched = await bcrypt.compare(userpassword, this.password);

  return isMatched;
};

module.exports = mongoose.model("User", UserSchema);
