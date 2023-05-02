const { StatusCodes } = require("http-status-codes");
const Card = require("../models/Card");
const User = require("../models/User");
const request = require("request");
const Transaction = require("../models/Transaction");
const { v4: uuidv4 } = require("uuid");

const { initializePayment, verifyPayment } = require("./paystackApi")(request);

const createCard = async (req, res) => {
  var edikeref = uuidv4();
  const usercard = await Card.findOne({ createdBy: req.user.id });
  if (usercard) {
    res.status(400).json({ msg: "Card Already Exist", status: "invalid" });
  }
  if (!usercard) {
    const user = await User.findById({ _id: req.user.id });
    const email = user.email;
    const amount = 5000;
    var reference = `EKI-${edikeref}`;
    const data = {
      email,
      amount,
      reference,
    };

    initializePayment(data, async (error, body) => {
      if (error) {
        return res
          .status(400)
          .json({ msg: `${error.message}`, status: "invalid" });
      }
      const response = JSON.parse(body.body);

      const transact = await Transaction.create({
        user_id: user._id,
        reference: reference,
        cus_email: user.email,
        cus_name: `${user.firstname + "" + user.lastname}`,
        cus_ref: user.customer_reference,
        type: "PAYSTACK",
        amount: amount / 100,
        description: "User Card Tokenization",
        verified: false,
      });
      await transact.save();
      return res.status(200).json({ response, status: "valid" });
    });
  }
};

const verifyCard = async (req, res) => {
  const ref = req.query.reference;

  verifyPayment(ref, async (error, body) => {
    if (error) {
      return res
        .status(400)
        .json({ msg: `${error.message}`, status: "invalid" });
    }

    const response = JSON.parse(body.body);
    if (response.data.authorization.bin.length < 1) {
      return res.status(400).json({
        msg: `Card Not Verified, Please Try Again`,
        status: "invalid",
      });
    }

    if (response.data.authorization.reusable == false) {
      return res.status(400).json({
        msg: `Card Not Verified, Please Try Again`,
        status: "invalid",
      });
    }

    const user = await User.findById({ _id: req.user.id });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "Unverified User", status: "invalid" });
    }

    const transact = await Transaction.findOne({
      reference: ref,
    });

    const card = await Card.create({
      createdBy: req.user.id,
      card: response.data.authorization,
    });

    await card.save();
    transact.verified = true;
    transact.payment_reference = response.data.id;
    transact.status = response.data.status;
    user.iscardadded = "approved";
    await transact.save();

    await user.save();
    return res
      .status(StatusCodes.CREATED)
      .json({ response, msg: "Card Verification Successful", status: "valid" });
  });
};

const getCard = async (req, res) => {
  const {
    user: { id },
  } = req;

  const card = await Card.findOne({
    createdBy: id,
  });

  if (!card) {
    return res.status(400).json({
      msg: "Card is Not Found",
      status: "invalid",
    });
  }

  if (card.length === 0) {
    const suspect1 = await Card.findByIdAndDelete({
      createdBy: id,
    });

    const suspect2 = await User.findById({
      _id: req.user.id,
    });

    await suspect1.save();

    suspect2.iscardadded = "pending";
    await suspect2.save();

    return res
      .status(400)
      .json({ msg: "Please Add a Card", status: "invalid" });
  }

  res.status(StatusCodes.OK).send(card);
};

module.exports = {
  createCard,
  verifyCard,
  getCard,
};

//
