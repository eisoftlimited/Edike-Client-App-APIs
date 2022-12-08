const { StatusCodes } = require("http-status-codes");
const { NotFound, BadRequest } = require("../errors");
const Card = require("../models/Card");

const createCard = async (req, res) => {
  const { card_number, expires_in, card_holder, card_type } = req.body;
  if (!card_number || !expires_in || !card_holder || !card_type) {
    throw new BadRequest("Enter all Fields");
  }
  req.body.createdBy = req.user.userId;
  const card = await Card.create(req.body);
  res.status(StatusCodes.CREATED).json({ card });
};

const getAllCards = async (req, res) => {
  const card = await Card.find(req.card).sort({
    date: -1,
  });
  res.status(StatusCodes.OK).json({ card, length: card.length });
};

const getCard = async (req, res) => {
  const {
    user: { userId },
    params: { id: cardId },
  } = req;

  const card = await Card.findOne({
    _id: cardId,
    createdBy: userId,
  });

  if (!card) {
    throw new NotFound("Card is Not Found");
  }

  res.status(StatusCodes.OK).send(card);
};

module.exports = {
  createCard,
  getAllCards,
  getCard,
};
