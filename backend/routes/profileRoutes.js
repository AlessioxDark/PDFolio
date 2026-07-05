const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

router.get("/", getProfile);
router.post("/edit", updateProfile);

module.exports = router;
