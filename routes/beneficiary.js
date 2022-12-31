const express = require("express");
const authenticationMiddleware = require("../middlewares/authentication");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const router = express.Router();

const {
  createBeneficiary,
  deleteBeneficiary,
  getAllBeneficiary,
  getBeneficiary,
  updateBeneficiary,
} = require("../controllers/beneficiary");

router.get("/all", authenticationMiddleware, getAllBeneficiary);
router.post(
  "/create",
  upload.single("img"),
  authenticationMiddleware,
  createBeneficiary
);
router.delete("/delete/:id", authenticationMiddleware, deleteBeneficiary);
router.patch("/update/:id", authenticationMiddleware, updateBeneficiary);
router.get("/get/:id", authenticationMiddleware, getBeneficiary);

module.exports = router;
