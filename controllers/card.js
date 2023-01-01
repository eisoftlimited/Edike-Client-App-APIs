const { StatusCodes } = require("http-status-codes");
const Card = require("../models/Card");
const User = require("../models/User");
const request = require("request");
const { initializePayment, verifyPayment } = require("./paystackApi")(request);

const createCard = async (req, res) => {
  const usercard = await Card.findOne({ createdBy: req.user.id });
  if (usercard) {
    res.status(400).json({ msg: "Card Already Exist", status: "invalid" });
  }
  if (!usercard) {
    const user = await User.findById({ _id: req.user.id });
    const email = user.email;
    const amount = 5000;
    const data = {
      email,
      amount,
    };

    initializePayment(data, (error, body) => {
      if (error) {
        return res
          .status(400)
          .json({ msg: `${error.message}`, status: "invalid" });
      }
      const response = JSON.parse(body.body);
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

    const user = await User.findById({ _id: req.user.id });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "Unverified User", status: "invalid" });
    }

    const card = await Card.create({
      createdBy: req.user.id,
      card: response.data.authorization,
    });

    await card.save();
    user.iscardadded = "approved";
    await user.save();
    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "Card Verification Successful", status: "valid" });
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
