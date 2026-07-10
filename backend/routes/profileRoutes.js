const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");
const requireAuth = require("../middlewares/auth.cjs");

router.get("/", requireAuth, getProfile);
router.post("/edit", requireAuth, updateProfile);

module.exports = router;
