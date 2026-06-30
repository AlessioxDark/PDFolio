const express = require("express");
const router = express.Router();
const {
  askAi,
  markMessagesAsSaved,
  markMessageAsModified,
  markMessageAsRejected,
} = require("../controllers/aiController");

// POST /api/ai/ask/:documentId
router.post("/ask/:documentId", askAi);

// PATCH /api/ai/messages/:documentId/mark-saved
router.patch("/messages/:documentId/mark-saved", markMessagesAsSaved);

// PATCH /api/ai/messages/:documentId/mark-modified
router.patch("/messages/:documentId/mark-modified", markMessageAsModified);

// PATCH /api/ai/messages/:documentId/mark-rejected
router.patch("/messages/:documentId/mark-rejected", markMessageAsRejected);

module.exports = router;
