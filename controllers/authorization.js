const User = require("../models/User");
const statusCodes = require("http-status-codes");
const { BadRequest, UnAuthenticated, GoodResponse } = require("../errors");
const mailgun = require("mailgun-js");
const bcrypt = require("bcryptjs");
const DOMAIN = process.env.MAILGUN_SERVER;
const { generateOTP } = require("../utilities/otp");
const cloudinary = require("cloudinary").v2;
const request = require("request");
const paystack = require("paystack-api")(`${process.env.PAYSTACK_APP_KEY}`);

const registerEmail = async (req, res) => {
  const { email, password, firstname, lastname, phone } = req.body;

  if (!email || !password || !firstname || !lastname || !phone) {
    throw new BadRequest("Enter all Fields");
  }
  const user = await User.findOne({ email });
  if (user) {
    throw new UnAuthenticated("Email Already Exist");
  }

  const salt = await bcrypt.genSaltSync(10);
  const hashpassword = await bcrypt.hash(password, salt);

  const otp = generateOTP(6);
  const mg = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: DOMAIN,
  });
  const data = {
    from: "Edike <edikeeduloan@gmail.com>",
    to: email,
    subject: "Edike Account Activation",
    html: `
      <h2>Enter OTP to activate your account</h2>
      <h3>
       Welcome to Edike, Enter OTP for Account Verification.
      </h3>
      <p style="font-size:35px ; font-weight:700">
        ${otp}
      </p>
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
    phone: req.body.phone,
    otpToken: otp,
    isAccountVerified: "pending",
  });
  await newUser.save();
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

  const token = user.createJWT();
  res.status(statusCodes.OK).json({
    user: {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    },
    token,
  });
};

const loadUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.status(statusCodes.OK).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(statusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

const verifyNIN = async (req, res) => {
  const { nin } = req.body;
  const profileImage = req.files.image;

  if (!nin || !profileImage) {
    throw new BadRequest("Enter all Fields");
  }

  const image = {
    data: new Buffer.from(profileImage.data, "base64"),
    contentType: profileImage.mimetype,
  };

  const options = {
    method: "POST",
    url: "https://api.dojah.io/api/v1/kyc/nin/verify",
    headers: {
      Appid: process.env.DOJAH_APP_ID,
      Authorization: "",
      accept: "text/plain",
      "content-type": "application/json",
    },
    body: { nin: nin, selfie_image: image.data },
    json: true,
  };

  request(options, function (error, response, body) {
    if (error) throw new BadRequest(error.message);

    console.log(body);
    return res.status(200).json({
      user: body,
      status: "valid",
    });
  });
};

const verifyBVN = async (req, res) => {
  paystack.verification
    .resolveBVN({ bvn: `${req.body.bvn}` })
    .then(function (body) {
      res.send(body);
    })
    .catch(function (error) {
      res.send({
        msg: `${error.error.message}`,
      });
    });
};

const activateAccount = async (req, res) => {
  const { otpToken } = req.body;
  if (!otpToken) {
    throw new BadRequest("Enter Otp Code");
  }
  const user = await User.findOne({ otpToken });

  if (user.otpToken !== Number(otpToken)) {
    return res
      .status(400)
      .json({ msg: "Invalid Verification", status: "invalid" });
  }
  user.otpToken = undefined;
  user.isAccountVerified = "approved";
  await user.save();

  return res.status(200).json({
    msg: "Verification Successful",
    status: "valid",
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

      const otp = generateOTP(6);
      user.resetPasswordToken = otp;
      user
        .save()
        .then((user) => {
          const mg = mailgun({
            apiKey: process.env.MAILGUN_API_KEY,
            domain: DOMAIN,
          });
          const data = {
            from: "Edike <edikeeduloan@gmail.com>",
            to: email,
            subject: "Edike Reset Password",
            html: `
              <h2>Enter OTP to reset your account</h2>
              <p>
               Edike Reset Password, Enter OTP .
              </p>
              <p style="font-size:35px ; font-weight:700">
                ${user.resetPasswordToken}
              </p>
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
        .json({ message: "Invalid OTP Code", status: "invalid" });

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

const profileUpload = async (req, res) => {
  const {
    user: { userId },
  } = req;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_APISECRET,
  });

  const file = req.files.image;

  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    public_id: `${Date.now()}`,
    resource_type: "auto",
    folder: "Edike",
  });

  User.findOne({
    _id: userId,
  }).then((user) => {
    if (!user)
      return res.status(401).json({
        message: "Something Went Wrong",
        status: "invalid",
      });

    user.publicId = result.public_id;
    user.profileImage = result.url;

    user.save((err) => {
      if (err)
        return res.status(500).json({ msg: err.message, status: "invalid" });
      res.status(200).json({
        msg: "Image Upload Successful",
        status: "valid",
      });
    });
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
  profileUpload,
};
