const express = require("express");
const authenticationMiddleware = require("../middlewares/authentication");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
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
  uploadIDCard,
  checkAccountStatus,
  createAddressBill,
  createNextOfKinDetails,
  contactedMail,
  subscribedmail,
} = require("../controllers/authorization");

router.get("/user", authenticationMiddleware, loadUser);
router.get("/user/status", authenticationMiddleware, checkAccountStatus);
router.post("/resend/otp", resendOTP);
router.post("/resend/resetpass/otp", resendResetPasswordOTP);
router.get("/list/bankCode", listBank);
router.post("/register", registerEmail);
router.post("/activate/account", activateAccount);
router.post("/login", loginEmail);
router.post(
  "/verify/nin",
  upload.single("img"),
  authenticationMiddleware,
  verifyNIN
);
router.post(
  "/verify/bvn",
  upload.single("img"),
  authenticationMiddleware,
  verifyBVN
);
router.post(
  "/bank/bank-statement",
  upload.single("bank_file"),
  authenticationMiddleware,
  addBankStatement
);

router.post(
  "/upload/id_card",
  upload.single("img"),
  authenticationMiddleware,
  uploadIDCard
);

router.get(
  "/bank/user-bank-statement",
  authenticationMiddleware,
  getBankStatement
);
router.post("/forgot-password", forgotPassword);
router.post("/reset", reset);
router.post("/reset-password", resetPassword);
router.patch("/user/update/profile", authenticationMiddleware, profileUpdate);
router.post(
  "/user/address",
  upload.array("houseAddressLink", 10),
  authenticationMiddleware,
  createAddressBill
);
router.post(
  "/user/next-of-kin/details",
  authenticationMiddleware,
  createNextOfKinDetails
);
router.post("/user/new/welcome", contactedMail);
router.post("/user/new/subscribe", subscribedmail);

module.exports = router;
