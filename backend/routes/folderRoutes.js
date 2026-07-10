const express = require("express");
const router = express.Router();
const {
  createFolder,
  deleteFolder,
} = require("../controllers/folderController");
const requireAuth = require("../middlewares/auth.cjs");

// POST /api/folders
router.post("/", requireAuth, createFolder);

// DELETE /api/folders/:folderId
router.delete("/:folderId", requireAuth, deleteFolder);

module.exports = router;
