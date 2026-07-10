const express = require("express");
const router = express.Router();
const { globalSearch } = require("../controllers/searchController");
// POST /api/auth/register
const requireAuth = require("../middlewares/auth.cjs");
router.get("/global", requireAuth, globalSearch);

module.exports = router;
