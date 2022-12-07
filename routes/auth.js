const express = require("express");
const authenticationMiddleware = require("../middlewares/authentication");
// const multer = require("multer");
// const multerStorage = multer.memoryStorage();
// const upload = multer({ storage: multerStorage });
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
  profileUpload,
} = require("../controllers/authorization");

router.get("/user", authenticationMiddleware, loadUser);
router.post("/register", registerEmail);
router.post("/activate/account", activateAccount);
router.post("/login", loginEmail);
router.post("/verify/nin", verifyNIN);
router.post("/verify/bvn", verifyBVN);
router.post("/forgot-password", forgotPassword);
router.post("/reset", reset);
router.post("/reset-password", resetPassword);
router.post("/user/upload/profile", authenticationMiddleware, profileUpload);

module.exports = router;
