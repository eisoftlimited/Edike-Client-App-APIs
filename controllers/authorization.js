const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const { BadRequest, UnAuthenticated } = require("../errors");
const mailgun = require("mailgun-js");
const bcrypt = require("bcryptjs");
const DOMAIN = process.env.MAILGUN_SERVER;
const { generateOTP, convertBase } = require("../utilities/otp");
const cloudinary = require("cloudinary").v2;
const request = require("request");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});

const registerEmail = async (req, res) => {
  const { email, password, firstname, lastname, phone } = req.body;

  if (!email || !password || !firstname || !lastname || !phone) {
    throw new BadRequest("Enter all Fields");
  }
  if (phone.length !== 11) {
    throw new BadRequest("Invalid Phone Number");
  }

  const user = await User.findOne({ email });
  if (user) {
    throw new UnAuthenticated("Email Already Exist");
  }

  const salt = await bcrypt.genSaltSync(10);
  const hashpassword = await bcrypt.hash(password, salt);

  const otp = generateOTP();

  const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN });
  const data = {
    from: `${process.env.EMAIL_FROM}`,
    to: email,
    subject: "Edike Account Activation",
    html: `
      <body style="padding:10px 4px; font-weight:400">
        <h1>
          Welcome to Edike.
        </h1>
        <h1>
        Enter OTP for Account Verification.
        </h1>
        <p style="font-size:40px ; font-weight:700 ; text-align: center">
        ${otp}
        </p>
      </body>
    `,
  };
  mg.messages().send(data, function (error) {
    if (error) {
      return res.status(400).json({
        msg: error.message,
      });
    }

    return res.status(200).json({
      msg: "We've sent a 6-digit Activation Code to your Email Address",
      status: "valid",
    });
  });

  const newUser = await User.create({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: hashpassword,
    phone: `+234${req.body.phone}`,
    otpToken: otp,
    isAccountVerified: "pending",
    isnin: "pending",
    isbvn: "pending",
    isloaned: "pending",
    iscardadded: "pending",
  });

  await newUser.save();
};

const resendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequest("Kindly Enter your Email Account with us");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnAuthenticated("Invalid Email Address");
  }
  const otp = generateOTP();

  user.otpToken = otp;
  await user.save();

  const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN });
  const data = {
    from: `${process.env.EMAIL_FROM}`,
    to: user.email,
    subject: "Edike Account Activation",
    html: `
      <body style="padding:10px 4px; font-weight:400">
        <h1>
          Welcome to Edike.
        </h1>
        <h1>
        Enter OTP for Account Verification.
        </h1>
        <p style="font-size:40px ; font-weight:700 ; text-align: center">
        ${otp}
        </p>
      </body>
    `,
  };
  mg.messages().send(data, function (error) {
    if (error) {
      return res.status(400).json({
        msg: error.message,
      });
    }

    return res.status(200).json({
      msg: "We've sent a 6-digit Activation Code to your Email Address",
      status: "valid",
    });
  });
};

const resendResetPasswordOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequest("Kindly Enter your Email Account with us");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnAuthenticated("Invalid Email Address");
  }
  const otp = generateOTP();
  user.resetPasswordToken = otp;
  await user.save();

  const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN });
  const data = {
    from: `${process.env.EMAIL_FROM}`,
    to: user.email,
    subject: "Edike Reset Password",
    html: `
      <body style="padding:10px 4px; font-weight:400">
        <h1>
          Welcome to Edike.
        </h1>
        <h1>
        Enter OTP to Reset Password.
        </h1>
        <p style="font-size:40px ; font-weight:700 ; text-align: center">
        ${otp}
        </p>
      </body>
    `,
  };
  mg.messages().send(data, function (error) {
    if (error) {
      return res.status(400).json({
        msg: error.message,
      });
    }

    return res.status(200).json({
      msg: "We've sent a 6-digit Reset Code to your Email Address",
      status: "valid",
    });
  });
};

const loginEmail = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequest("Enter Email and Password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnAuthenticated("Invalid Email Credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnAuthenticated("Invalid Password Credentials");
  }

  if (user.isAccountVerified === "pending") {
    throw new UnAuthenticated("Kindly Verify your Account, Check Your Mail");
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
    console.error(err.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

const verifyNIN = async (req, res) => {
  const { nin } = req.body;
  const profileImage = req.file;

  if (!nin) {
    throw new BadRequest("Enter Nigerian Identification Number");
  }
  if (!profileImage) {
    throw new BadRequest("Please Provide an Image");
  }
  if (nin.length !== 11) {
    throw new BadRequest("Incomplete NIN Number");
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_APISECRET,
  });

  const result = await cloudinary.uploader.upload(profileImage.tempFilePath, {
    public_id: `${Date.now()}`,
    resource_type: "auto",
    folder: "Edike User Profile Image- NIN",
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
        msg: "BVN Verification Service Unavailable",
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
  const profileImage = req.files.image;

  if (!bvn) {
    throw new BadRequest("Enter Bank Verification Number");
  }
  if (!profileImage) {
    throw new BadRequest("Please Provide an Image");
  }
  if (bvn.length !== 11) {
    throw new BadRequest("Incomplete BVN Number");
  }

  const result = await cloudinary.uploader.upload(profileImage.tempFilePath, {
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
        msg: "BVN Verification Service Unavailable",
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
    throw new BadRequest("Enter Otp Code");
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
    throw new BadRequest("Enter Email Address");
  }
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user)
        return res.status(401).json({
          msg: "Invalid Email Address",
          staus: "invalid",
        });

      const otp = generateOTP();
      user.resetPasswordToken = otp;
      user
        .save()
        .then((user) => {
          const mg = mailgun({
            apiKey: process.env.MAILGUN_API_KEY,
            domain: DOMAIN,
          });
          const data = {
            from: `${process.env.EMAIL_FROM}`,
            to: email,
            subject: "Edike Reset Password",
            html: `
            <body style="padding:10px 4px; font-weight:400">
              <h1>
               Edike Reset Password, Enter OTP .
              </h1>
              <p style="font-size:40px ; font-weight:700; text-align: center ">
                ${user.resetPasswordToken}
              </p>
            </body>
             
              `,
          };
          mg.messages().send(data, function (error) {
            if (error) {
              return res.status(400).json({
                msg: error.message,
                status: "invalid",
              });
            }

            return res.status(200).json({
              msg: "We've sent a 6-digit Activation Code to your Email Address",
              status: "valid",
            });
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
    throw new BadRequest("Enter the OTP code");
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
    throw new BadRequest("Enter All Fields");
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
    throw new BadRequest("Enter all Fields");
  }
  const user = await User.findByIdAndUpdate(
    {
      _id: id,
    },
    req.body,
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new NotFound("Something went wrong");
  }

  return res.status(StatusCodes.OK).json({
    user,
    msg: "Profile Update Successful",
    staus: "valid",
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
    if (error) throw new BadRequest(error);
    const ans = JSON.parse(body.body);
    res.status(StatusCodes.OK).send({ msg: ans, status: "valid" });
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
};
