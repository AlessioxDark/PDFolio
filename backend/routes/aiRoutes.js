const express = require("express");
const router = express.Router();
const { askAi } = require("../controllers/aiController");

// POST /api/ai/ask/:documentId
router.post("/ask/:documentId", askAi);

module.exports = router;
