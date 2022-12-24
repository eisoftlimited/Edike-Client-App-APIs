const { StatusCodes } = require("http-status-codes");
const { NotFound, BadRequest } = require("../errors");
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
  const { beneficiary_file } = req.files;
  const {
    beneficiary_name,
    beneficiary_amount,
    beneficiary_duration,
    bank_name,
    loan_type,
  } = req.body;
  if (
    !beneficiary_name ||
    !beneficiary_duration ||
    !beneficiary_amount ||
    !bank_name ||
    !loan_type
  ) {
    throw new BadRequest("Enter all Fields");
  }

  if (!beneficiary_file) {
    throw new BadRequest("Enter School Bill in PDF Format");
  }

  const result = await cloudinary.uploader.upload(
    req.files.beneficiary_file.tempFilePath,
    {
      public_id: `${Date.now()}`,
      resource_type: "raw",
      folder: "Edike User School Bill",
    }
  );

  const loan = await Loan.create({
    createdBy: req.user.id,
    beneficiary_name: req.body.beneficiary_name,
    loan_type: req.body.loan_type,
    bank_name: req.body.bank_name,
    beneficiary_duration: req.body.beneficiary_duration,
    beneficiary_amount: req.body.beneficiary_amount,
    beneficiary_file: result.secure_url,
    etag: result.etag,
    signature: result.signature,
    publicID: result.public_id,
    fileType: result.resource_type,
    beneficiaryFor: beneficiaryId,
  });

  await loan.save();
  const user = await User.findById({ _id: req.user.id });
  if (!user) {
    return res.status(400).json({ msg: "Unverified User", status: "invalid" });
  }
  user.isappliedforloan = "approved";
  await user.save();
  return res.status(StatusCodes.CREATED).json({ loan, status: "valid" });
};

const getAllLoans = async (req, res) => {
  const loan = await Loan.find(req.loan).sort({
    date: -1,
  });
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
