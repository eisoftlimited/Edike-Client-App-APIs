const express = require("express");
const authenticationMiddleware = require("../middlewares/authentication");
const router = express.Router();
const { listTransactions } = require("../controllers/transactions");

router.get(
  "/list/paystack-transactions",
  authenticationMiddleware,
  listTransactions
);

module.exports = router;
