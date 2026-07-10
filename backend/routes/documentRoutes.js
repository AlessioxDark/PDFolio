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
const requireAuth = require("../middlewares/auth.cjs");
router.post("/upload", requireAuth, upload.single("pdfFile"), uploadPdf);
router.get("/getall", requireAuth, getAllDocumentsAndFolders);
router.get("/deleted", requireAuth, getTrashDocuments);
router.get("/:pdfId", requireAuth, getSpecificDocument);
router.delete("/:pdfId", requireAuth, deletePdfFile);
router.patch("/:pdfId", requireAuth, updatePdf);
router.get("/:pdfId/notes", requireAuth, getNotesByDocumentId);
router.delete("/:pdfId/trash", requireAuth, trashPdfFile);
router.patch("/:pdfId/restore", requireAuth, restorePdfFile);
router.post("/:pdfId/notes", requireAuth, addNote);
router.delete("/:pdfId/notes/:noteId", requireAuth, deleteNote);
router.patch("/:pdfId/notes/:noteId", requireAuth, updateNote);

router.post("/:documentId/summary/pdf", requireAuth, exportSummaryPdf);
module.exports = router;
