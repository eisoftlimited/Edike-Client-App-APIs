const { StatusCodes } = require("http-status-codes");
const { NotFound, BadRequest } = require("../errors");
const Beneficiary = require("../models/Beneficiary");

const createBeneficiary = async (req, res) => {
  const { firstname, lastname, school, gender, dob, studentClass } = req.body;
  if (!firstname || !lastname || !school || !gender || !dob || !studentClass) {
    throw new BadRequest("Enter all Fields");
  }
  req.body.createdBy = req.user.id;
  const beneficiary = await Beneficiary.create(req.body);
  res.status(StatusCodes.CREATED).json({ beneficiary });
};

const getAllBeneficiary = async (req, res) => {
  const beneficiary = await Beneficiary.find({
    createdBy: req.user.id,
  }).sort({
    date: -1,
  });
  if (beneficiary.length === 0) {
    return res
      .status(400)
      .json({ msg: "No Beneficiary Added", status: "invalid" });
  }
  if (!beneficiary) {
    throw new NotFound("No Beneficiary Found");
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
    throw new BadRequest("Enter all Fields");
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
    throw new NotFound("Beneficiary does not exist");
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
    throw new NotFound("Beneficiary does not exist");
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
    throw new NotFound("Beneficiary does not exist");
  }

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
