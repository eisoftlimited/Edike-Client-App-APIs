// const { StatusCodes } = require("http-status-codes");
// const Beneficiary = require("../models/Beneficiary");
// const Loan = require("../models/Loan");
// const User = require("../models/User");
// const BankStatement = require("../models/BankStatement");
// const Card = require("../models/Card");
// const cloudinary = require("cloudinary").v2;
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_APIKEY,
//   api_secret: process.env.CLOUDINARY_APISECRET,
// });

// const createLoan = async (req, res) => {
//   const {
//     params: { id: beneficiaryId },
//   } = req;
//   const beneficiary_file = req.files;
//   const { beneficiary_amount, beneficiary_duration } = req.body;
//   if (!beneficiary_duration || !beneficiary_amount) {
//     return res.status(400).json({
//       msg: "Enter all Fields",
//       status: "invalid",
//     });
//   }

//   if (!beneficiary_file) {
//     return res.status(400).json({
//       msg: "Enter School Bill in the required Image format",
//       status: "invalid",
//     });
//   }

//   const user = await User.findById({ _id: req.user.id });
//   if (!user) {
//     return res.status(400).json({ msg: "Unverified User", status: "invalid" });
//   }

//   if (
//     user.isbankstatementadded === "pending" &&
//     user.iscardadded === "pending" &&
//     user.isAccountVerified === "pending" &&
//     user.isidcard === "pending"
//   ) {
//     return res.status(400).json({
//       msg: "Loan Application Declined, Please Complete KYC",
//       status: "invalid",
//     });
//   }

//   const beneficiary = await Beneficiary.findOne({ _id: beneficiaryId });
//   const card = await Card.findOne({ createdBy: req.user.id });
//   if (!beneficiary) {
//     return res.status(400).json({
//       msg: "Loan Application Declined, Please Add Card Beneficiary",
//       status: "invalid",
//     });
//   }

//   if (!card) {
//     return res.status(400).json({
//       msg: "Loan Application Declined, Please Add Card",
//       status: "invalid",
//     });
//   }

//   const userbankStatement = await BankStatement.find({
//     createdBy: req.user.id,
//   });

//   if (!userbankStatement) {
//     return res
//       .status(400)
//       .json({ msg: "Bank Statement is Not Found", status: "invalid" });
//   }

//   var diff =
//     (new Date(`${userbankStatement[0].sixMonths}`).getTime() -
//       new Date(`${new Date()}`).getTime()) /
//     1000;

//   diff /= 60 * 60 * 24 * 7 * 4;
//   const monthsDiff = Math.round(diff);

//   if (monthsDiff < 1) {
//     return res.status(400).json({
//       msg: "Loan Application Declined, Bank Statement Expired",
//       status: "invalid",
//     });
//   }

//   if (user.status === "blocked") {
//     return res.status(400).json({
//       msg: "Loan Application Declined, Your Account has been Temporarily Disabled",
//       status: "invalid",
//     });
//   }

//   if (user.isbvn === "approved" || user.isnin === "approved") {
// let multipleFileUpload = beneficiary_file.map((file) =>
//   cloudinary.uploader.upload(file.path, {
//     public_id: `${Date.now()}`,
//     resource_type: "auto",
//     folder: "Edike User Bill Credentials",
//   })
// );

// let result = await Promise.all(multipleFileUpload);

//     const loan = await Loan.create({
//       createdBy: req.user.id,
//       beneficiary_duration: req.body.beneficiary_duration,
//       beneficiary_amount: req.body.beneficiary_amount,
//       beneficiary_file_results: result,
//       beneficiaryFor: beneficiaryId,
//       beneficiaryDetails: beneficiary,
//       cardDetails: card,
//       bankCreds: userbankStatement[0].bankCreds,
//     });

//     await loan.save();
//     user.isappliedforloan = "approved";
//     await user.save();
//     return res.status(StatusCodes.CREATED).json({ loan, status: "valid" });
//   }
// };

// const getAllLoans = async (req, res) => {
//   const loan = await Loan.find({
//     createdBy: req.user.id,
//   }).sort({
//     date: -1,
//   });
//   if (loan.length === 0) {
//     return res
//       .status(400)
//       .json({ msg: "No Loan has been applied for", status: "invalid" });
//   }
//   if (!loan) {
//     return res
//       .status(400)
//       .json({ msg: "Loan Cannot be Found", status: "invalid" });
//   }
//   res.status(StatusCodes.OK).json({ loan, length: loan.length });
// };

// const getLoan = async (req, res) => {
//   const {
//     user: { id },
//     params: { id: beneficiaryId },
//   } = req;

//   const loan = await Loan.findOne({
//     _id: beneficiaryId,
//     createdBy: id,
//   });

//   if (!loan) {
//     return res
//       .status(400)
//       .json({ msg: "Loan Cannot be Found", status: "invalid" });
//   }

//   res.status(StatusCodes.OK).send(loan);
// };

// module.exports = {
//   createLoan,
//   getAllLoans,
//   getLoan,
// };

const { StatusCodes } = require("http-status-codes");
const Beneficiary = require("../models/Beneficiary");
const Loan = require("../models/Loan");
const User = require("../models/User");
const BankStatement = require("../models/BankStatement");
const Card = require("../models/Card");
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
    return res.status(400).json({
      msg: "Enter all Fields",
      status: "invalid",
    });
  }

  if (!beneficiary_file) {
    return res.status(400).json({
      msg: "Enter School Bill in the required Image format",
      status: "invalid",
    });
  }

  const user = await User.findById({ _id: req.user.id });
  if (!user) {
    return res.status(400).json({ msg: "Unverified User", status: "invalid" });
  }

  if (
    user.isbankstatementadded === "pending" &&
    user.iscardadded === "pending" &&
    user.isAccountVerified === "pending" &&
    user.isidcard === "pending" &&
    user.isnextofkin === "pending" &&
    user.isaddressadded === "pending"
  ) {
    return res.status(400).json({
      msg: "Loan Application Declined, Please Complete KYC",
      status: "invalid",
    });
  }

  const beneficiary = await Beneficiary.findOne({ _id: beneficiaryId });
  const card = await Card.findOne({ createdBy: req.user.id });
  if (!beneficiary) {
    return res.status(400).json({
      msg: "Loan Application Declined, Please Add Card Beneficiary",
      status: "invalid",
    });
  }

  if (!card) {
    return res.status(400).json({
      msg: "Loan Application Declined, Please Add Card",
      status: "invalid",
    });
  }

  const userbankStatement = await BankStatement.find({
    createdBy: req.user.id,
  });

  if (!userbankStatement) {
    return res
      .status(400)
      .json({ msg: "Bank Statement is Not Found", status: "invalid" });
  }

  var diff =
    (new Date(`${userbankStatement[0].sixMonths}`).getTime() -
      new Date(`${new Date()}`).getTime()) /
    1000;

  diff /= 60 * 60 * 24 * 7 * 4;
  const monthsDiff = Math.round(diff);

  if (monthsDiff < 1) {
    return res.status(400).json({
      msg: "Loan Application Declined, Bank Statement Expired",
      status: "invalid",
    });
  }

  if (user.status === "blocked") {
    return res.status(400).json({
      msg: "Loan Application Declined, Your Account has been Temporarily Disabled",
      status: "invalid",
    });
  }

  if (user.isnextofkin === "pending") {
    return res.status(400).json({
      msg: "Loan Application Declined, Please Add Next of Kin Details",
      status: "invalid",
    });
  }

  if (user.isaddressadded === "pending") {
    return res.status(400).json({
      msg: "Loan Application Declined, Please Enter Your House Address",
      status: "invalid",
    });
  }

  if (user.isbvn === "approved" || user.isnin === "approved") {
    let multipleFileUpload = beneficiary_file.map((file) =>
      cloudinary.uploader.upload(file.path, {
        public_id: `${Date.now()}`,
        resource_type: "auto",
        folder: "Edike User Bill Credentials",
      })
    );

    let result = await Promise.all(multipleFileUpload);

    const loans = await Loan.find({});

    const loan = await Loan.create({
      loan_reference: `EDI/${loans.length + 1}`,
      createdBy: req.user.id,
      beneficiary_duration: req.body.beneficiary_duration,
      beneficiary_amount: req.body.beneficiary_amount,
      beneficiary_file_results: result,
      beneficiaryFor: beneficiaryId,
      beneficiaryDetails: beneficiary,
      cardDetails: card,
      bankCreds: userbankStatement[0].bankCreds,
      pdf: userbankStatement[0].pdf_link,
    });

    await loan.save();
    user.isappliedforloan = "approved";
    await user.save();
    return res.status(StatusCodes.CREATED).json({ loan, status: "valid" });
  }
};

const getAllLoans = async (req, res) => {
  const loan = await Loan.find({
    createdBy: req.user.id,
  }).sort({
    date: -1,
  });
  if (loan.length === 0) {
    return res
      .status(400)
      .json({ msg: "No Loan has been applied for", status: "invalid" });
  }
  if (!loan) {
    return res
      .status(400)
      .json({ msg: "Loan Cannot be Found", status: "invalid" });
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
    return res
      .status(400)
      .json({ msg: "Loan Cannot be Found", status: "invalid" });
  }

  res.status(StatusCodes.OK).send(loan);
};

module.exports = {
  createLoan,
  getAllLoans,
  getLoan,
};
