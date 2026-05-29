const express = require("express");
const router = express.Router();
const {
  getAllDocumentsAndFolders,
  getSpecificDocument,
  getNotesByDocumentId,
  addNote,
  deleteNote,
  updateNote,
} = require("../controllers/documentsController");
// POST /api/auth/register
// Riceve i dati dal Context dopo la registrazione su Supabase
router.get("/getall", getAllDocumentsAndFolders);
router.get("/:pdfId", getSpecificDocument);
router.get("/:pdfId/notes", getNotesByDocumentId);
router.post("/:pdfId/notes", addNote);
router.delete("/:pdfId/notes/:noteId", deleteNote);
router.patch("/:pdfId/notes/:noteId", updateNote);

module.exports = router;
