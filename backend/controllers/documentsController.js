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
module.exports = {
  getAllDocumentsAndFolders,
  getSpecificDocument,
  getNotesByDocumentId,
  addNote,
  deleteNote,
};
