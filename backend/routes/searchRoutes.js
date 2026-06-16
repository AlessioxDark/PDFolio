const express = require("express");
const router = express.Router();
const { globalSearch } = require("../controllers/searchController");
// POST /api/auth/register
// Riceve i dati dal Context dopo la registrazione su Supabase
router.get("/global", globalSearch);

module.exports = router;
