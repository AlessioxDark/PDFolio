const Documents = require("../models/documentsModel.js");
const getAllDocumentsAndFolders = async (req, res) => {
  try {
    const { data, error } = await Documents.getAll(req, res);
    if (error) throw error;
    res.status(200).json({
      data: data,
      message: "documenti ottenuti con successo",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'ottenimento dei documenti",
      details: error.message,
    });
  }
};
const getSpecificDocument = async (req, res) => {
  try {
    const { data, error } = await Documents.getSpecificDocument(req);
    if (error) throw error;
    res.status(200).json({
      data: data,
      message: "documento ottenuti con successo",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'ottenimento del documento",
      details: error.message,
    });
  }
};
const addNote = async (req, res) => {
  try {
    const { data, error } = await Documents.addNote(req);
    if (error) throw error;
    res.status(200).json({
      data: data,
      message: "Nota creata con successo",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante la creazione della nota",
      details: error.message,
    });
  }
};
const getNotesByDocumentId = async (req, res) => {
  try {
    const { data, error } = await Documents.getNotesByDocumentId(req);
    if (error) throw error;
    res.status(200).json({
      data: data,
      message: "documento ottenuti con successo",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'ottenimento del documento",
      details: error.message,
    });
  }
};
const deleteNote = async (req, res) => {
  try {
    const { data, error } = await Documents.deleteNote(req);
    if (error) throw error;
    res.status(200).json({
      data: data,
      message: "documento ottenuti con successo",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'ottenimento del documento",
      details: error.message,
    });
  }
};
const updateNote = async (req, res) => {
  try {
    const { data, error } = await Documents.updateNote(req);
    if (error) throw error;
    res.status(200).json({
      data: data,
      message: "documento ottenuto con successo",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'ottenimento del documento",
      details: error.message,
    });
  }
};
const uploadPdf = async (req, res) => {
  try {
    const { data, error } = await Documents.uploadPdf(req);
    if (error) throw error;
    res.status(200).json({
      data: data,
      message: "documento ottenuto con successo",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'ottenimento del documento",
      details: error.message,
    });
  }
};
const trashPdfFile = async (req, res) => {
  try {
    const { data, error } = await Documents.trashPdfFile(req);
    if (error) throw error;
    res.status(200).json({
      data: data,
      message: "documento cestinato con successo",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante la cestinazione del documento",
      details: error.message,
    });
  }
};
const updatePdf = async (req, res) => {
  try {
    const { data, error } = await Documents.updatePdf(req);
    if (error) throw error;
    res.status(200).json({
      data: data,
      message: "documento aggiornato con successo",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'aggiornamento del documento",
      details: error.message,
    });
  }
};
const exportSummaryPdf = async (req, res) => {
  try {
    const { data, error } = await Documents.exportSummaryPdf(req, res);
    if (error) throw error;
    // res.status(200).json({
    //   data: data,
    //   message: "documento esportato con successo",
    //   success: true,
    // });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'esportazione del documento",
      details: error.message,
    });
  }
};
const deletePdfFile = async (req, res) => {
  try {
    const { data, error } = await Documents.deletePdfFile(req, res);
    if (error) throw error;
    res.status(200).json({
      data: data,
      message: "documenti eliminati ottenuti con successo",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'ottenimento dei documenti eliminati",
      details: error.message,
    });
  }
};

const getTrashDocuments = async (req, res) => {
  try {
    const { data, error } = await Documents.getTrashDocuments(req, res);
    if (error) throw error;
    res.status(200).json({
      data: data,
      message: "documenti eliminati ottenuti con successo",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'ottenimento dei documenti eliminati",
      details: error.message,
    });
  }
};

const restorePdfFile = async (req, res) => {
  try {
    const { data, error } = await Documents.restorePdfFile(req);
    if (error) throw error;
    res.status(200).json({
      data: data,
      message: "documento ripristinato con successo",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante il ripristino del documento",
      details: error.message,
    });
  }
};

module.exports = {
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
};
