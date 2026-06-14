const Folder = require("../models/folderModel.js");
const createFolder = async (req, res) => {
  try {
    const { data, error } = await Folder.createFolder(req, res);
    if (error) throw error;
    res.status(200).json({
      data: data,
      message: "cartella creata con successo",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante la creazione della cartella",
      details: error.message,
    });
  }
};

module.exports = {
  createFolder,
};
