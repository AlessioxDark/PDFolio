const express = require("express");
const router = express.Router();
const {
  askAi,
  markMessagesAsSaved,
  markMessageAsModified,
  markMessageAsRejected,
} = require("../controllers/aiController");
const requireAuth = require("../middlewares/auth.cjs");

// POST /api/ai/ask/:documentId
router.post("/ask/:documentId", requireAuth, askAi);

// PATCH /api/ai/messages/:documentId/mark-saved
router.patch(
  "/messages/:documentId/mark-saved",
  requireAuth,
  markMessagesAsSaved,
);

// PATCH /api/ai/messages/:documentId/mark-modified
router.patch(
  "/messages/:documentId/mark-modified",
  requireAuth,
  markMessageAsModified,
);

// PATCH /api/ai/messages/:documentId/mark-rejected
router.patch(
  "/messages/:documentId/mark-rejected",
  requireAuth,
  markMessageAsRejected,
);

module.exports = router;
