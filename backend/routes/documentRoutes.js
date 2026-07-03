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
  trashPdfFile,
  updatePdf,
  exportSummaryPdf,
  getTrashDocuments,
  deletePdfFile,
  restorePdfFile,
} = require("../controllers/documentsController");
const upload = require("../middlewares/multer");

router.post("/upload", upload.single("pdfFile"), uploadPdf);
router.get("/getall", getAllDocumentsAndFolders);
router.get("/deleted", getTrashDocuments);
router.get("/:pdfId", getSpecificDocument);
router.delete("/:pdfId", deletePdfFile);
router.patch("/:pdfId", updatePdf);
router.get("/:pdfId/notes", getNotesByDocumentId);
router.delete("/:pdfId/trash", trashPdfFile);
router.patch("/:pdfId/restore", restorePdfFile);
router.post("/:pdfId/notes", addNote);
router.delete("/:pdfId/notes/:noteId", deleteNote);
router.patch("/:pdfId/notes/:noteId", updateNote);

router.post("/:documentId/summary/pdf", exportSummaryPdf);
module.exports = router;
