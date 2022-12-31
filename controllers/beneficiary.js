const { StatusCodes } = require("http-status-codes");
const Beneficiary = require("../models/Beneficiary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});

const createBeneficiary = async (req, res) => {
  const { firstname, lastname, school, gender, dob, studentClass } = req.body;
  const photo = req.file;
  if (!firstname || !lastname || !school || !gender || !dob || !studentClass) {
    return res.status(400).json({
      msg: "Enter all Fields",
      status: "invalid",
    });
  }

  if (!photo) {
    return res.status(400).json({
      msg: "Please Provide an Image",
      status: "invalid",
    });
  }

  const result = await cloudinary.uploader.upload(photo.path, {
    public_id: `${Date.now()}`,
    resource_type: "auto",
    folder: "Edike User Beneficiary Image",
  });

  const beneficiary = await Beneficiary.create({
    createdBy: req.user.id,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    school: req.body.school,
    gender: req.body.gender,
    dob: req.body.dob,
    studentClass: req.body.studentClass,
    beneficiaryImage: result.secure_url,
    beneficiaryPubicId: result.public_id,
  });

  res.status(StatusCodes.CREATED).json({ beneficiary });
};

const getAllBeneficiary = async (req, res) => {
  const {
    user: { id },
  } = req;
  const beneficiary = await Beneficiary.find({
    createdBy: id,
  }).sort({
    date: -1,
  });
  if (beneficiary.length === 0) {
    return res
      .status(400)
      .json({ msg: "No Beneficiary Added", status: "invalid" });
  }
  if (!beneficiary) {
    return res.status(400).json({
      msg: "No Beneficiary Found",
      status: "invalid",
    });
  }
  res.status(StatusCodes.OK).json({ beneficiary, length: beneficiary.length });
};

const updateBeneficiary = async (req, res) => {
  const {
    body: { firstname, lastname, school, gender, dob, studentClass },
    user: { id },
    params: { id: beneficiaryId },
  } = req;

  if (!firstname || !lastname || !school || !gender || !dob || !studentClass) {
    return res.status(400).json({
      msg: "Enter all Fields",
      status: "invalid",
    });
  }

  const beneficiary = await Beneficiary.findByIdAndUpdate(
    {
      _id: beneficiaryId,
      createdBy: id,
    },
    req.body,
    { new: true, runValidators: true }
  );

  if (!beneficiary) {
    return res.status(400).json({
      msg: "Beneficiary does not exist",
      status: "invalid",
    });
  }

  res.status(StatusCodes.OK).send(beneficiary);
};

const getBeneficiary = async (req, res) => {
  const {
    user: { id },
    params: { id: beneficiaryId },
  } = req;

  const beneficiary = await Beneficiary.findOne({
    _id: beneficiaryId,
    createdBy: id,
  });

  if (!beneficiary) {
    return res.status(400).json({
      msg: "Beneficiary does not exist",
      status: "invalid",
    });
  }

  res.status(StatusCodes.OK).send(beneficiary);
};

const deleteBeneficiary = async (req, res) => {
  const {
    user: { id },
    params: { id: beneficiaryId },
  } = req;

  const beneficiary = await Beneficiary.findByIdAndRemove({
    _id: beneficiaryId,
    createdBy: id,
  });

  if (!beneficiary) {
    return res.status(400).json({
      msg: "Beneficiary does not exist",
      status: "invalid",
    });
  }

  await cloudinary.uploader.destroy(`${beneficiary.beneficiaryPubicId}`);

  res
    .status(StatusCodes.OK)
    .send({ msg: "Beneficiary Deleted Successfully", status: "valid" });
};

module.exports = {
  createBeneficiary,
  getAllBeneficiary,
  deleteBeneficiary,
  updateBeneficiary,
  getBeneficiary,
};
