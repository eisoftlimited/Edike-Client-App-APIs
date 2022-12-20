const { StatusCodes } = require("http-status-codes");
const { NotFound, BadRequest } = require("../errors");
const Loan = require("../models/Loan");

const createLoan = async (req, res) => {
  const {
    beneficiary_file,
    beneficiary_name,
    beneficiary_amount,
    beneficiary_duration,
  } = req.body;
  if (
    !beneficiary_file ||
    !beneficiary_name ||
    !beneficiary_duration ||
    !beneficiary_amount
  ) {
    throw new BadRequest("Enter all Fields");
  }
  req.body.createdBy = req.user.userId;
  const loan = await Loan.create(req.body);
  res.status(StatusCodes.CREATED).json({ loan });
};

const getAllLoans = async (req, res) => {
  const loan = await Loan.find(req.loan).sort({
    date: -1,
  });
  res.status(StatusCodes.OK).json({ loan, length: loan.length });
};

const getLoan = async (req, res) => {
  const {
    user: { userId },
    params: { id: beneficiaryId },
  } = req;

  const loan = await Loan.findOne({
    _id: beneficiaryId,
    createdBy: userId,
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
