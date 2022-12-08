const express = require("express");
const authenticationMiddleware = require("../middlewares/authentication");
const router = express.Router();

const { createLoan, getAllLoans, getLoan } = require("../controllers/loan");

router.get("/all", authenticationMiddleware, getAllLoans);
router.post("/apply/beneficiary_loan", authenticationMiddleware, createLoan);
router.get("/get/:id", authenticationMiddleware, getLoan);

module.exports = router;
