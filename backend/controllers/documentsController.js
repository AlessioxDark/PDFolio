const Documents = require("../models/documentsModel.js");
const getAllDocumentsAndFolders = async (req, res) => {
  try {
    const { data, error } = await Documents.getAll(req, res);
    const reducedNotes = data.noteData.reduce((acc, note) => {
      if (!acc[note.document_id]) acc[note.document_id] = [];
      acc[note.document_id].push(note);
      return acc;
    }, {});
    const newData = data.folderAndDocumentsData.map((f) => {
      return {
        ...f,
        documenti: f.documenti.map((d) => {
          return {
            ...d,
            notes: reducedNotes[d.document_id] || [], // aggiungi note
          };
        }),
      };
    });
    console.log("ecco il new data", newData);
    if (error) throw error;
    res.status(200).json({
      data: newData,
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
module.exports = { getAllDocumentsAndFolders };
