const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["regular", "system", "cfo", "cto", "ad"],
      default: "regular",
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
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
    },
    birthdate: {
      type: String,
    },
    nationality: {
      type: String,
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
    phoneNumber1: {
      type: Number,
    },
    phoneNumber2: {
      type: Number,
    },

    password: {
      type: String,
      required: [true, "Enter your Password"],
      minlength: 6,
    },
    bvn: {
      type: Number,
    },
    nin: {
      type: Number,
    },
    profileImage: {
      type: String,
    },
    otpToken: {
      type: Number,
    },
    isAccountVerified: {
      type: String,
    },
    resetPasswordToken: {
      type: Number,
    },
    maidenname: {
      type: String,
    },
    self_origin_lga: {
      type: String,
    },
    self_origin_place: {
      type: String,
    },
    self_origin_state: {
      type: String,
    },
    religion: {
      type: String,
    },
    gender: {
      type: String,
    },
    publicID: {
      type: String,
    },
    residence_address: {
      type: String,
    },
    marital_status: {
      type: String,
    },
    nok_firstname: {
      type: String,
    },
    nok_lastname: {
      type: String,
    },
    nok_middename: {
      type: String,
    },
    nok_address: {
      type: String,
    },
    nok_lga: {
      type: String,
    },
    nok_state: {
      type: String,
    },
    nok_town: {
      type: String,
    },
    isbvn: {
      type: String,
    },
    isnin: {
      type: String,
    },
    isappliedforloan: {
      type: String,
    },
    iscardadded: {
      type: String,
    },
    isidcard: {
      type: String,
    },
    idcard: {
      type: Array,
    },
    isbankstatementadded: {
      type: String,
    },
    houseAddress: {
      type: String,
    },
    houseAddressLink: {
      type: Array,
    },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (userpassword) {
  const isMatched = await bcrypt.compare(userpassword, this.password);

  return isMatched;
};

module.exports = mongoose.model("Users", UserSchema);
