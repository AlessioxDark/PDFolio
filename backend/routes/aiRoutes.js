const express = require("express");
const router = express.Router();
const { askAi, markMessagesAsSaved } = require("../controllers/aiController");

// POST /api/ai/ask/:documentId
router.post("/ask/:documentId", askAi);

// PATCH /api/ai/messages/:documentId/mark-saved
router.patch("/messages/:documentId/mark-saved", markMessagesAsSaved);

module.exports = router;
