const express = require("express");
const router = express.Router();
const {
  getAllDocumentsAndFolders,
} = require("../controllers/documentsController");
// POST /api/auth/register
// Riceve i dati dal Context dopo la registrazione su Supabase
router.get("/getall", getAllDocumentsAndFolders);

module.exports = router;
