const express = require("express");
const authenticationMiddleware = require("../middlewares/authentication");
// const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
const router = express.Router();

const {
  loginEmail,
  registerEmail,
  loadUser,
  activateAccount,
  verifyNIN,
  verifyBVN,
  forgotPassword,
  reset,
  resetPassword,
  profileUpdate,
  listBank,
  resendOTP,
  resendResetPasswordOTP,
  addBankStatement,
  getBankStatement,
} = require("../controllers/authorization");

router.get("/user", authenticationMiddleware, loadUser);
router.post("/resend/otp", resendOTP);
router.post("/resend/resetpass/otp", resendResetPasswordOTP);
router.get("/list/bankCode", listBank);
router.post("/register", registerEmail);
router.post("/activate/account", activateAccount);
router.post("/login", loginEmail);
router.post("/verify/nin", authenticationMiddleware, verifyNIN);
router.post("/verify/bvn", authenticationMiddleware, verifyBVN);
router.post("/bank/bank-statement", authenticationMiddleware, addBankStatement);
router.get(
  "/bank/user-bank-statement",
  authenticationMiddleware,
  getBankStatement
);
router.post("/forgot-password", forgotPassword);
router.post("/reset", reset);
router.post("/reset-password", resetPassword);
router.patch("/user/update/profile", authenticationMiddleware, profileUpdate);

module.exports = router;
