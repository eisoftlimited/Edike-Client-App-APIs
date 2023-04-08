const User = require("../models/User");
const Contact = require("../models/Contact");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const mailgun = require("mailgun-js");
const bcrypt = require("bcryptjs");

const DOMAIN = process.env.MAILGUN_SERVER;
const { generateOTP, convertBase } = require("../utilities/otp");
const cloudinary = require("cloudinary").v2;
const request = require("request");
const date = new Date().getUTCFullYear();
const fs = require("fs");
const BankStatement = require("../models/BankStatement");
const sendEmail = require("./../utilities/sendEmail");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});

const registerEmail = async (req, res) => {
  const { email, password, firstname, lastname, phone } = req.body;

  if (!email || !password || !firstname || !lastname || !phone) {
    return res.status(400).json({
      msg: "Enter all Fields",
      status: "invalid",
    });
  }
  if (phone.length !== 11) {
    return res.status(400).json({
      msg: "Incomplete Phone Number",
      status: "invalid",
    });
  }

  const user = await User.findOne({ email });
  const userPhone = await User.findOne({ phone });

  if (user) {
    return res.status(400).json({
      msg: "Email Already Exist",
      status: "invalid",
    });
  }

  if (userPhone) {
    return res.status(400).json({
      msg: "User with this Phone Number Already Exist",
      status: "invalid",
    });
  }

  const salt = await bcrypt.genSaltSync(10);
  const hashpassword = await bcrypt.hash(password, salt);

  const otp = generateOTP();

  const data = {
    otp: otp,
  };

  // using send grid to send out emails
  sendEmail.sendGridEmail(
    email, // recipient email
    "d-b978e6208d1c458787352650489b40e2", // template id
    "Congratulations 🎉, Welcome to Edike", // subject
    data
  );

  // response...
  const customers = await User.find({});

  const newUser = await User.create({
    customer_reference: `EDK/${customers.length + 1}`,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: hashpassword,
    phone: `+234${req.body.phone}`,
    otpToken: otp,
    isAccountVerified: "pending",
    isnin: "pending",
    isbvn: "pending",
    isappliedforloan: "pending",
    iscardadded: "pending",
    isbankstatementadded: "pending",
    isidcard: "pending",
    isaddressadded: "pending",
    isnextofkin: "pending",
  });

  await newUser.save();

  return res.status(200).json({
    msg: "We've sent a 6-digit Activation Code to your Email Address",
    status: "valid",
  });
};

const resendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      msg: "Kindly Enter your Email Account with us",
      status: "invalid",
    });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      msg: "Invalid Email Address",
      status: "invalid",
    });
  }
  const otp = generateOTP();

  user.otpToken = otp;
  await user.save();

  const data = {
    otp: otp,
  };

  // using send grid to send out emails
  sendEmail.sendGridEmail(
    email, // recipient email
    "d-39770c5c4609466dbb05b5af4fbdd5f6", // template id
    "Edike OTP Verification", // subject
    data
  );

  return res.status(200).json({
    msg: "We've sent a 6-digit Activation Code to your Email Address",
    status: "valid",
  });
};

const resendResetPasswordOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      msg: "Kindly Enter your Email Account with us",
      status: "invalid",
    });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      msg: "Invalid Email Credentials",
      status: "invalid",
    });
  }
  const otp = generateOTP();
  user.resetPasswordToken = otp;
  await user.save();

  const data = {
    otp: otp,
  };

  // using send grid to send out emails
  sendEmail.sendGridEmail(
    email, // recipient email
    "d-391a706b81c74ec9982aa50a41c90e9d", // template id
    "Reset Password Verification", // subject
    data
  );

  return res.status(200).json({
    msg: "We've sent a 6-digit Reset Code to your Email Address",
    status: "valid",
  });
};

const loginEmail = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      msg: "Enter Email and Password",
      status: "invalid",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      msg: "Invalid Email Credentials",
      status: "invalid",
    });
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return res.status(400).json({
      msg: "Invalid Password Credentials",
      status: "invalid",
    });
  }

  if (user.isAccountVerified === "pending") {
    return res.status(400).json({
      msg: "Kindly Verify your Account, Check Your Mail",
      status: "invalid",
    });
  }

  const useful = await User.find({ email }).select("-password");
  const payload = {
    user: {
      id: user._id,
    },
  };
  const token = jwt.sign(payload, process.env.JWTSECRET, {
    expiresIn: process.env.JWTLIFETIME,
  });

  return res.status(StatusCodes.OK).json({
    useful,
    token,
  });
};

const loadUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.status(StatusCodes.OK).json(user);
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Server Error",
      status: "invalid",
    });
  }
};

const verifyNIN = async (req, res) => {
  const { nin } = req.body;
  const profileImage = req.file;

  if (!nin) {
    return res.status(400).json({
      msg: "Enter Nigerian Identification Number",
      status: "invalid",
    });
  }
  if (!profileImage) {
    return res.status(400).json({
      msg: "Please Provide an Image",
      status: "invalid",
    });
  }
  if (nin.length !== 11) {
    return res.status(400).json({
      msg: "Incomplete NIN Number",
      status: "invalid",
    });
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_APISECRET,
  });

  const result = await cloudinary.uploader.upload(profileImage.path, {
    public_id: `${Date.now()}`,
    resource_type: "auto",
    folder: "Edike User Profile Image-NIN",
  });

  const buff = await convertBase(result.secure_url);

  const options = {
    method: "POST",
    url: "https://api.dojah.io/api/v1/kyc/nin/verify",
    headers: {
      Appid: `${process.env.DOJAH_APP_ID}`,
      "Content-type": "application/json",
      Authorization: `${process.env.DOJAH_API_KEY}`,
    },
    body: { nin: nin, selfie_image: buff },
    json: true,
  };

  request(options, async function (response, body) {
    if (body.statusCode === 400) {
      cloudinary.uploader.destroy(`${result.public_id}`);
      return res.status(400).json({
        response,
        msg: "Invalid image uploaded for selfie_image",
        status: "invalid",
      });
    }
    if (response) {
      cloudinary.uploader.destroy(`${result.public_id}`);
      return res.status(400).json({
        response,
        body,
        msg: "NIN Verification Service Unavailable, Please Use BVN to Continue Verification",
        status: "invalid",
      });
    }

    const user = await User.findById({ _id: req.user.id });
    if (!user) {
      cloudinary.uploader.destroy(`${result.public_id}`);
      return res.status(400).json({
        msg: "Not Authorized",
        status: "invalid",
      });
    }

    user.firstname = body.body.entity.firstname;
    user.lastname = body.body.entity.surname;
    user.middlename = body.body.entity.middlename;
    user.birthdate = body.body.entity.birthdate;
    user.phoneNumber1 = body.body.entity.telephoneno;
    user.gender = body.body.entity.gender;
    user.self_origin_state = body.body.entity.state;
    user.self_origin_lga = body.body.entity.residence_lga;
    user.self_origin_place = body.body.entity.place;
    user.nin = body.body.entity.nin;
    user.isnin = "approved";
    user.residence_address = body.body.entity.residence_AddressLine1;
    user.religion = body.body.entity.religion;
    user.nationality = body.body.entity.nationality;
    user.nok_firstname = body.body.entity.nok_firstname;
    user.nok_lastname = body.body.entity.nok_lastname;
    user.nok_middename = body.body.entity.nok_middlename;
    user.nok_address = body.body.entity.nok_address1;
    user.nok_lga = body.body.entity.nok_lga;
    user.nok_state = body.body.entity.nok_state;
    user.nok_town = body.body.entity.nok_town;
    user.maidenname = body.body.entity.maidenname;

    await user.save();

    return res.status(200).json({
      msg: "NIN Verification Successful",
      status: "valid",
    });
  });
};

const verifyBVN = async (req, res) => {
  const { bvn } = req.body;
  const profileImage = req.file;

  if (!bvn) {
    return res.status(400).json({
      msg: "Enter Bank Verification Number",
      status: "invalid",
    });
  }
  if (!profileImage) {
    return res.status(400).json({
      msg: "Please Provide an Image",
      status: "invalid",
    });
  }
  if (bvn.length !== 11) {
    return res.status(400).json({
      msg: "Incomplete BVN Number",
      status: "invalid",
    });
  }

  const result = await cloudinary.uploader.upload(profileImage.path, {
    public_id: `${Date.now()}`,
    resource_type: "auto",
    folder: "Edike User Profile Image-BVN",
  });

  const buff = await convertBase(result.secure_url);

  const options = {
    method: "POST",
    url: "https://api.dojah.io/api/v1/kyc/bvn/verify",
    headers: {
      Appid: `${process.env.DOJAH_APP_ID}`,
      "Content-type": "application/json",
      Authorization: `${process.env.DOJAH_API_KEY}`,
    },
    body: { bvn: bvn, selfie_image: buff },
    json: true,
  };

  request(options, async function (response, body) {
    if (body.statusCode === 400) {
      cloudinary.uploader.destroy(`${result.public_id}`);
      return res.status(400).json({
        response,
        msg: "Invalid image uploaded for selfie_image",
        status: "invalid",
      });
    }
    if (response) {
      cloudinary.uploader.destroy(`${result.public_id}`);
      return res.status(400).json({
        response,
        body,
        msg: "BVN Verification Service Unavailable, Please Use NIN to Continue Verification",
        status: "invalid",
      });
    }

    const user = await User.findById({ _id: req.user.id });
    if (!user) {
      cloudinary.uploader.destroy(`${result.public_id}`);
      return res.status(400).json({
        msg: "Not Authorized",
        status: "invalid",
      });
    }

    user.firstname = body.body.entity.first_name;
    user.lastname = body.body.entity.last_name;
    !user.middlename
      ? (user.middlename = body.body.entity.middle_name)
      : user.middlename;
    !user.birthdate
      ? (user.birthdate = body.body.entity.date_of_birth)
      : user.birthdate;
    !user.phoneNumber1
      ? (user.phoneNumber1 = body.body.entity.phone_number1)
      : user.phoneNumber1;
    !user.phoneNumber2
      ? (user.phoneNumber2 = body.body.entity.phone_number2)
      : user.phoneNumber2;
    !user.gender ? (user.gender = body.body.entity.gender) : user.gender;
    !user.self_origin_state
      ? (user.self_origin_state = body.body.entity.state_of_origin)
      : user.self_origin_state;
    !user.self_origin_lga
      ? (user.self_origin_lga = body.body.entity.lga_of_origin)
      : user.self_origin_lga;
    !user.self_origin_place
      ? (user.self_origin_place = body.body.entity.lga_of_residence)
      : user.self_origin_place;
    !user.nin ? (user.nin = body.body.entity.nin) : user.nin;
    user.isbvn === "pending"
      ? (user.isbvn = "approved")
      : user.isbvn === "pending";
    !user.bvn ? (user.bvn = body.body.entity.bvn) : user.bvn;
    !user.profileImage
      ? (user.profileImage = result.secure_url)
      : user.profileImage;
    !user.publicID ? (user.publicID = result.public_id) : user.publicID;
    !user.residence_address
      ? (user.residence_address = body.body.entity.residential_address)
      : user.residence_address;
    !user.marital_status
      ? (user.marital_status = body.body.entity.marital_status)
      : user.marital_status;

    await user.save();

    return res.status(200).json({
      msg: "BVN Verification Successful",
      status: "valid",
    });
  });
};

const activateAccount = async (req, res) => {
  const { otpToken } = req.body;
  if (!otpToken) {
    return res.status(400).json({
      msg: "Enter Otp Code",
      status: "invalid",
    });
  }

  User.findOne({
    otpToken: req.body.otpToken,
  }).then((user) => {
    if (!user)
      return res
        .status(401)
        .json({ msg: "Invalid OTP Veification", status: "invalid" });

    user.otpToken = undefined;
    user.isAccountVerified = "approved";

    // Save
    user.save((err) => {
      if (err)
        return res.status(500).json({ msg: err.message, status: "invalid" });

      const payload = {
        user: {
          id: user._id,
        },
      };

      const token = jwt.sign(payload, process.env.JWTSECRET, {
        expiresIn: process.env.JWTLIFETIME,
      });

      return res.status(200).json({
        msg: "Verification Successful",
        status: "valid",
        token,
      });
    });
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      msg: "Enter Email Address",
      status: "invalid",
    });
  }
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user)
        return res.status(401).json({
          msg: "Invalid Email Address",
          status: "invalid",
        });

      const otp = generateOTP();
      user.resetPasswordToken = otp;
      user
        .save()
        .then((user) => {
          const data = {
            otp: otp,
          };

          // using send grid to send out emails
          sendEmail.sendGridEmail(
            email, // recipient email
            "d-7efe659fc4264d61a3f462826bd3db71", // template id
            "Reset Password OTP Verification", // subject
            data
          );

          return res.status(200).json({
            msg: "We've sent a 6-digit Activation Code to your Email Address",
            status: "valid",
          });
        })
        .catch((err) =>
          res.status(500).json({ msg: err.message, status: "invalid" })
        );
    })
    .catch((err) =>
      res.status(500).json({ msg: err.message, status: "invalid" })
    );
};

const reset = async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({
      msg: "Enter the OTP Code",
      status: "invalid",
    });
  }

  User.findOne({
    resetPasswordToken: req.body.otp,
  }).then((user) => {
    if (!user)
      return res
        .status(401)
        .json({ msg: "Invalid OTP Veification", status: "invalid" });

    user.resetPasswordToken = undefined;

    // Save
    user.save((err) => {
      if (err)
        return res.status(500).json({ msg: err.message, status: "invalid" });
      res.status(200).json({ msg: "Verification Successful", status: "valid" });
    });
  });
};

const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      msg: "Enter All Fields",
      status: "invalid",
    });
  }

  const salt = await bcrypt.genSaltSync(10);
  const hashpassword = await bcrypt.hash(password, salt);

  User.findOne({
    email: req.body.email,
  }).then((user) => {
    if (!user)
      return res
        .status(401)
        .json({ message: "Invalid Email Address", status: "invalid" });

    user.password = hashpassword;
    user.resetPasswordToken = undefined;

    user.save((err) => {
      if (err)
        return res.status(500).json({ msg: err.message, status: "invalid" });
      res
        .status(200)
        .json({ msg: "Your new password has been updated.", status: "valid" });
    });
  });
};

const profileUpdate = async (req, res) => {
  const {
    body: { firstname, lastname, phone },
    user: { id },
  } = req;

  if (!firstname || !lastname || !phone) {
    return res.status(400).json({
      msg: "Enter All Fields",
      status: "invalid",
    });
  }
  const user = await User.findByIdAndUpdate(
    {
      _id: id,
    },
    req.body,
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(400).json({ msg: "Unverified User", status: "invalid" });
  }

  return res.status(StatusCodes.OK).json({
    user,
    msg: "Profile Update Successful",
    status: "valid",
  });
};

const listBank = async (req, res) => {
  const options = {
    method: "GET",
    url: `https://api.paystack.co/bank`,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_APP_KEY}`,
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
  };

  request(options, function (error, body) {
    if (error) {
      return res.status(400).json({
        msg: `${error.message}`,
        status: "invalid",
      });
    }

    const ans = JSON.parse(body.body);
    res.status(StatusCodes.OK).send({ msg: ans, status: "valid" });
  });
};

const addBankStatement = async (req, res) => {
  const bank_file = req.file;
  const { bank_name, loan_access_type } = req.body;
  if (!bank_name || !loan_access_type) {
    return res.status(400).json({
      msg: "Enter all Fields",
      status: "invalid",
    });
  }
  if (!bank_file) {
    return res.status(400).json({
      msg: "Enter Your 6months Bank Statement in Pdf format",
      status: "invalid",
    });
  }

  const userbankStatement = await BankStatement.find({
    createdBy: req.user.id,
  });

  if (!userbankStatement) {
    return res
      .status(400)
      .json({ msg: "Kindly add a valid Bank Statement", status: "invalid" });
  }

  const trans = fs.readFileSync(`${bank_file.path}`, { encoding: "base64" });
  const user = await User.findById({ _id: req.user.id });
  if (!user) {
    return res.status(400).json({ msg: "Unverified User", status: "invalid" });
  }
  const userBankStats = await BankStatement.create({
    createdBy: req.user.id,
    bank_name: req.body.bank_name,
    loan_access_type: req.body.loan_access_type,
    bankPdf: trans,
    pdf_link: req.body.pdf_link,
  });

  await userBankStats.save();
  user.isbankstatementadded = "approved";
  await user.save();
  return res.status(StatusCodes.CREATED).json({
    msg: "Bank Statement Verification Successful",
    status: "valid",
  });
};

const getBankStatement = async (req, res) => {
  const {
    user: { id },
  } = req;

  const userbankStatement = await BankStatement.find({
    createdBy: id,
  });

  if (!userbankStatement) {
    return res
      .status(400)
      .json({ msg: "Bank Statement is not found", status: "invalid" });
  }

  var diff =
    (new Date(`${userbankStatement[0].sixMonths}`).getTime() -
      new Date(`${new Date()}`).getTime()) /
    1000;

  diff /= 60 * 60 * 24 * 7 * 4;
  const monthsDiff = Math.round(diff);

  if (monthsDiff > 1) {
    return res.status(200).json({
      msg: `Bank Statement Exist and is Valid till ${new Date(
        `${userbankStatement[0].sixMonths}`
      ).toDateString()}`,
      status: "valid",
    });
  }
  if (monthsDiff < 1) {
    const userbankStatement = await BankStatement.findByIdAndDelete({
      createdBy: id,
    });
    await userbankStatement.save();

    const user = await User.findById({ _id: id });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "Unverified User", status: "invalid" });
    }
    user.isbankstatementadded = "pending";
    await user.save();

    return res.status(400).json({
      msg: "Bank Statement is Expired , Please Add a New One",
      status: "invalid",
    });
  }
};

const uploadIDCard = async (req, res) => {
  const photo = req.file;
  if (!photo) {
    return res.status(400).json({
      msg: "Please Provide an Image",
      status: "invalid",
    });
  }

  const user = await User.findById({ _id: req.user.id });
  if (user.isidcard === "approved") {
    return res.status(400).json({
      msg: "ID Card Exist Already",
      status: "invalid",
    });
  }

  const result = await cloudinary.uploader.upload(photo.path, {
    public_id: `${Date.now()}`,
    resource_type: "auto",
    folder: "Edike User ID Card Image",
  });

  if (!user) {
    cloudinary.uploader.destroy(`${result.public_id}`);
    return res.status(400).json({
      msg: "Not Authorized",
      status: "invalid",
    });
  }
  user.isidcard = "approved";
  user.idcard = result;
  await user.save();

  return res.status(200).json({
    msg: "ID Card Upload Successful",
    status: "valid",
  });
};

const checkAccountStatus = async () => {
  const user = await User.findById({ _id: req.user.id });

  if (user.status === "blocked") {
    return res.status(200).json({
      msg: "Your Account has been Temporarily Disabled, Please Contact Support",
    });
  }

  if (user.status === "active") {
    return res.status(200).json({
      msg: "",
    });
  }
};

const createAddressBill = async (req, res) => {
  const houseAddressLink = req.files;
  const { houseAddress } = req.body;
  if (!houseAddress) {
    return res.status(400).json({
      msg: "Enter all Fields",
      status: "invalid",
    });
  }

  if (!houseAddressLink) {
    return res.status(400).json({
      msg: "Enter Address Bill in the required Image format",
      status: "invalid",
    });
  }

  const user = await User.findById({ _id: req.user.id });
  if (!user) {
    return res.status(400).json({ msg: "Unverified User", status: "invalid" });
  }

  let multipleFileUpload = houseAddressLink.map((file) =>
    cloudinary.uploader.upload(file.path, {
      public_id: `${Date.now()}`,
      resource_type: "auto",
      folder: "Edike User Location Bill Credentials",
    })
  );

  let result = await Promise.all(multipleFileUpload);

  user.houseAddress = houseAddress;
  user.houseAddressLink = result;
  user.isaddressadded = "approved";
  await user.save();
  return res
    .status(200)
    .json({ msg: "Address Verification Successful", status: "valid" });
};

const createNextOfKinDetails = async (req, res) => {
  const {
    nextofkinfirstname,
    nextofkinlastname,
    nextofkinaddress,
    nextofkinphonenumber,
  } = req.body;

  if (!nextofkinfirstname || !nextofkinlastname || !nextofkinaddress) {
    return res.status(400).json({
      msg: "Enter all Fields",
      status: "invalid",
    });
  }

  if (nextofkinphonenumber.length !== 11) {
    return res.status(400).json({
      msg: "Incomplete Phone Number",
      status: "invalid",
    });
  }

  const user = await User.findById({ _id: req.user.id });
  if (!user) {
    return res.status(400).json({ msg: "Unverified User", status: "invalid" });
  }

  user.nextofkinfirstname = nextofkinfirstname;
  user.nextofkinlastname = nextofkinlastname;
  user.nextofkinaddress = nextofkinaddress;
  user.nextofkinphonenumber = nextofkinphonenumber;
  user.isnextofkin = "approved";
  await user.save();
  return res
    .status(200)
    .json({ msg: "Next Of Kin Verification Successful", status: "valid" });
};

const subscribedmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      msg: "Enter all Fields",
      status: "invalid",
    });
  }

  const user = await Contact.findOne({ email });

  if (user) {
    return res.status(400).json({
      msg: "Email Already Exist",
      status: "invalid",
    });
  }

  const data = {};

  // using send grid to send out emails
  sendEmail.sendGridEmail(
    email, // recipient email
    "d-87fcca9e10984dbe961d8b6918b949e6", // template id
    "You've Subscribed 🎉, Welcome to Edike", // subject
    data
  );

  return res.status(200).json({
    msg: " Welcome Onboard, You have Subscribed Successfully ",
    status: "valid",
  });
};

const contactedMail = async (req, res) => {
  const { email, name, message, phone } = req.body;

  if (!email || !name || !message || !phone) {
    return res.status(400).json({
      msg: "Enter all Fields",
      status: "invalid",
    });
  }

  const user = await Contact.findOne({ email });

  if (user) {
    return res.status(400).json({
      msg: "Email Already Exist",
      status: "invalid",
    });
  }

  const data = {};

  // using send grid to send out emails
  sendEmail.sendGridEmail(
    email, // recipient email
    "d-1645555886504261a478aa2d56589f4d", // template id
    "Welcome🎉, We're Delighted!", // subject
    data
  );

  const newUser = await Contact.create({
    name: req.body.name,
    email: req.body.email,
    phone: `+234${req.body.phone}`,
    message: req.body.message,
  });

  await newUser.save();

  return res.status(200).json({
    msg: "You will get a feedback from us in a Jiffy! ",
    status: "valid",
  });
};

module.exports = {
  registerEmail,
  loginEmail,
  loadUser,
  activateAccount,
  verifyNIN,
  verifyBVN,
  forgotPassword,
  reset,
  resetPassword,
  profileUpdate,
  listBank,
  resendOTP,
  resendResetPasswordOTP,
  addBankStatement,
  getBankStatement,
  uploadIDCard,
  checkAccountStatus,
  createAddressBill,
  createNextOfKinDetails,
  contactedMail,
  subscribedmail,
};
