const { StatusCodes } = require("http-status-codes");
const { NotFound, BadRequest } = require("../errors");
const Card = require("../models/Card");
const User = require("../models/User");
const request = require("request");

const createCard = async (req, res) => {
  const { card_number, expires_in, card_holder, cvc } = req.body;
  if (!card_number || !expires_in || !card_holder || !cvc) {
    throw new BadRequest("Enter all Fields");
  }
  if (cvc.length !== 3) {
    throw new BadRequest("Incomplete CVC");
  }
  if ((card_number.length < 14) | (card_number.length > 18)) {
    throw new BadRequest("Incomplete Card Number");
  }
  const usercard = await Card.find({ createdBy: req.user.id });
  if (usercard) {
    res.status(400).json({ msg: "Card Already Exist", status: "invalid" });
  } else {
    const bin = card_number.substring(0, 6);
    const options = {
      method: "GET",
      url: `https://api.paystack.co/decision/bin/${bin}`,
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_APP_KEY}`,
        "content-type": "application/json",
        "cache-control": "no-cache",
      },
    };

    request(options, async function (error, body) {
      if (error) throw new BadRequest(error);
      const ans = JSON.parse(body.body);

      const card = await Card.create({
        createdBy: req.user.id,
        card_number: req.body.card_number,
        card_holder: req.body.card_holder,
        expires_in: req.body.expires_in,
        cvc: req.body.cvc,
        bin: ans.data.bin,
        brand: ans.data.brand,
        country_code: ans.data.country_code,
        country_name: ans.data.country_name,
        card_type: ans.data.card_type,
        bank: ans.data.bank,
      });

      await card.save();
      const user = await User.findById({ _id: req.user.id });
      if (!user) {
        return res
          .status(400)
          .json({ msg: "Unverified User", status: "invalid" });
      }
      user.iscardadded = "approved";
      await user.save();
      return res.status(StatusCodes.CREATED).json({ card, status: "valid" });
    });
  }
};

const getCard = async (req, res) => {
  const {
    user: { id },
    params: { id: cardId },
  } = req;

  const card = await Card.findOne({
    _id: cardId,
    createdBy: id,
  });

  if (!card) {
    throw new NotFound("Card is Not Found");
  }

  res.status(StatusCodes.OK).send(card);
};

module.exports = {
  createCard,
  getCard,
};
