const express = require("express");
const authenticationMiddleware = require("../middlewares/authentication");
const router = express.Router();

const { createCard, getAllCards, getCard } = require("../controllers/card");

router.get("/all", authenticationMiddleware, getAllCards);
router.post("/add/debit_card", authenticationMiddleware, createCard);
router.get("/get/:id", authenticationMiddleware, getCard);

module.exports = router;
