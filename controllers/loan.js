const { StatusCodes } = require("http-status-codes");
const { NotFound, BadRequest } = require("../errors");
const Beneficiary = require("../models/Beneficiary");
const Loan = require("../models/Loan");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});

const createLoan = async (req, res) => {
  const {
    params: { id: beneficiaryId },
  } = req;
  const beneficiary_file = req.files;
  const { beneficiary_amount, beneficiary_duration } = req.body;
  if (!beneficiary_duration || !beneficiary_amount) {
    throw new BadRequest("Enter all Fields");
  }

  if (!beneficiary_file) {
    throw new BadRequest("Enter School Bill in the required formats");
  }

  const user = await User.findById({ _id: req.user.id });
  if (!user) {
    return res.status(400).json({ msg: "Unverified User", status: "invalid" });
  }

  if (
    user.isbankstatementadded === "pending" ||
    user.isbvn === "pending" ||
    user.isnin === "pending" ||
    user.iscardadded === "pending" ||
    user.isAccountVerified === "pending"
  ) {
    throw new BadRequest("Loan Application Declined, Please Complete KYC");
  }

  let multipleFileUpload = beneficiary_file.map((file) =>
    cloudinary.uploader.upload(file.path, {
      public_id: `${Date.now()}`,
      resource_type: "raw",
      folder: "Edike User Bill Credentials",
    })
  );

  let result = await Promise.all(multipleFileUpload);
  const beneficiary = await Beneficiary.findOne({ _id: beneficiaryId });
  if (!beneficiary) {
    throw new BadRequest("No Beneficiary Found");
  }

  const loan = await Loan.create({
    createdBy: req.user.id,
    beneficiary_duration: req.body.beneficiary_duration,
    beneficiary_amount: req.body.beneficiary_amount,
    beneficiary_file_results: result,
    beneficiaryFor: beneficiaryId,
    beneficiaryDetails: beneficiary,
  });

  await loan.save();
  user.isappliedforloan = "approved";
  await user.save();
  return res.status(StatusCodes.CREATED).json({ loan, status: "valid" });
};

const getAllLoans = async (req, res) => {
  const loan = await Loan.find({
    createdBy: req.user.id,
  }).sort({
    date: -1,
  });
  if (loan.length === 0) {
    return res
      .status(StatusCodes.OK)
      .json({ msg: "No Loan has been applied for", status: "valid" });
  }
  if (!loan) {
    throw new NotFound("Loan Not Found");
  }
  res.status(StatusCodes.OK).json({ loan, length: loan.length });
};

const getLoan = async (req, res) => {
  const {
    user: { id },
    params: { id: beneficiaryId },
  } = req;

  const loan = await Loan.findOne({
    _id: beneficiaryId,
    createdBy: id,
  });

  if (!loan) {
    throw new NotFound("Loan is Not Found");
  }

  res.status(StatusCodes.OK).send(loan);
};

module.exports = {
  createLoan,
  getAllLoans,
  getLoan,
};
