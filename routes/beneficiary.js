const express = require("express");
const authenticationMiddleware = require("../middlewares/authentication");
const router = express.Router();

const {
  createBeneficiary,
  deleteBeneficiary,
  getAllBeneficiary,
  getBeneficiary,
  updateBeneficiary,
} = require("../controllers/beneficiary");

router.get("/all", authenticationMiddleware, getAllBeneficiary);
router.post("/create", authenticationMiddleware, createBeneficiary);
router.delete("/delete/:id", authenticationMiddleware, deleteBeneficiary);
router.patch("/update/:id", authenticationMiddleware, updateBeneficiary);
router.get("/get/:id", authenticationMiddleware, getBeneficiary);

module.exports = router;
