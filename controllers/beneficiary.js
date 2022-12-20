const { StatusCodes } = require("http-status-codes");
const { NotFound, BadRequest } = require("../errors");
const Beneficiary = require("../models/Beneficiary");

const createBeneficiary = async (req, res) => {
  const { firstname, lastname, school, gender, dob, studentClass } = req.body;
  if (!firstname || !lastname || !school || !gender || !dob || !studentClass) {
    throw new BadRequest("Enter all Fields");
  }
  req.body.createdBy = req.user.userId;
  const beneficiary = await Beneficiary.create(req.body);
  res.status(StatusCodes.CREATED).json({ beneficiary });
};

const getAllBeneficiary = async (req, res) => {
  const beneficiary = await Beneficiary.find(req.beneficiary).sort({
    date: -1,
  });
  res.status(StatusCodes.OK).json({ beneficiary, length: beneficiary.length });
};

const updateBeneficiary = async (req, res) => {
  const {
    body: { firstname, lastname, school, gender, dob, studentClass },
    user: { userId },
    params: { id: beneficiaryId },
  } = req;

  if (!firstname || !lastname || !school || !gender || !dob || !studentClass) {
    throw new BadRequest("Enter all Fields");
  }

  const beneficiary = await Beneficiary.findByIdAndUpdate(
    {
      _id: beneficiaryId,
      createdBy: userId,
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
    user: { userId },
    params: { id: beneficiaryId },
  } = req;

  const beneficiary = await Beneficiary.findOne({
    _id: beneficiaryId,
    createdBy: userId,
  });

  if (!beneficiary) {
    throw new NotFound("Beneficiary does not exist");
  }

  res.status(StatusCodes.OK).send(beneficiary);
};

const deleteBeneficiary = async (req, res) => {
  const {
    user: { userId },
    params: { id: beneficiaryId },
  } = req;

  const beneficiary = await Beneficiary.findByIdAndRemove({
    _id: beneficiaryId,
    createdBy: userId,
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
