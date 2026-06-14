const express = require("express");
const router = express.Router();
const { createFolder } = require("../controllers/folderController");

router.post("/", createFolder);

module.exports = router;
