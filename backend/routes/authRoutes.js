const express = require("express");
const router = express.Router();
const { SignUp } = require("../controllers/authController");
// POST /api/auth/register
// Riceve i dati dal Context dopo la registrazione su Supabase
router.post("/register", SignUp);

module.exports = router;
