const express = require("express");
const authenticationMiddleware = require("../middlewares/authentication");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const router = express.Router();

const { createLoan, getAllLoans, getLoan } = require("../controllers/loan");

router.get("/all", authenticationMiddleware, getAllLoans);
router.post(
  "/apply/beneficiary_loan/:id",
  upload.array("beneficiary_file", 10),
  authenticationMiddleware,
  createLoan
);
router.get("/get/:id", authenticationMiddleware, getLoan);

module.exports = router;
