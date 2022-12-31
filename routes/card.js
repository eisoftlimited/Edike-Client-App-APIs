const express = require("express");
const authenticationMiddleware = require("../middlewares/authentication");
const router = express.Router();
const { createCard, getCard, verifyCard } = require("../controllers/card");

router.get("/paystack/pay", authenticationMiddleware, createCard);
router.get("/paystack/callback", authenticationMiddleware, verifyCard);
router.get("/get/debit_card", authenticationMiddleware, getCard);

module.exports = router;
