const { StatusCodes } = require("http-status-codes");
const fs = require("fs");
const { NotFound, BadRequest } = require("../errors");
const Loan = require("../models/Loan");
const request = require("request");
const path = require("path");

const createLoan = async (req, res) => {
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
  const head = path.dirname(`${req.files.beneficiary_file.tempFilePath}`);
  const tail = path.basename(`${req.files.beneficiary_file.tempFilePath}`);
  let ans = `${head}` + "\\" + `${tail}`;

  const options = {
    method: "POST",
    url: "https://prod-categorization-service.pub.credrails.com/v1alpha2/analyseAccountStatement?view=detailed",
    headers: {
      accept: "application/json",
      "content-type": "multipart/form-data",
      "X-API-KEY": process.env.CREDRAILS_KEY,
    },
    formData: {
      analysisType: loan_type,
      fspId: bank_name,
      data: {
        value: fs.createReadStream(`${ans}`),
        options: {
          filename: `${req.files.beneficiary_file.name}`,
          contentType: "application/pdf",
        },
      },
    },
  };

  request(options, async function (error, body) {
    if (error) {
      return res.status(400).json({ error });
    }

    const trans = JSON.parse(body.body);
    res.status(StatusCodes.OK).json({
      trans: trans,
      status: "valid",
    });
  });

  // req.body.createdBy = req.user.id;
  // const loan = await Loan.create(req.body);
  // res.status(StatusCodes.CREATED).json({ loan });
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
