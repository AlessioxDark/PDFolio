const express = require("express");
const router = express.Router();
const {
  getAllDocumentsAndFolders,
  getSpecificDocument,
  getNotesByDocumentId,
  addNote,
  deleteNote,
  updateNote,
  uploadPdf,
} = require("../controllers/documentsController");
const upload = require("../middlewares/multer");

router.post("/upload", upload.single("pdfFile"), uploadPdf);
router.get("/getall", getAllDocumentsAndFolders);
router.get("/:pdfId", getSpecificDocument);
router.get("/:pdfId/notes", getNotesByDocumentId);
router.post("/:pdfId/notes", addNote);
router.delete("/:pdfId/notes/:noteId", deleteNote);
router.patch("/:pdfId/notes/:noteId", updateNote);

module.exports = router;
