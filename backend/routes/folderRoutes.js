const express = require("express");
const router = express.Router();
const {
  createFolder,
  deleteFolder,
} = require("../controllers/folderController");

router.post("/", createFolder);
router.delete("/:folderId", deleteFolder);

module.exports = router;
