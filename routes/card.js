const express = require("express");
const authenticationMiddleware = require("../middlewares/authentication");
const router = express.Router();
const { createCard, getCard } = require("../controllers/card");

router.post("/add/debit_card", authenticationMiddleware, createCard);
router.get("/get/:id", authenticationMiddleware, getCard);

module.exports = router;
