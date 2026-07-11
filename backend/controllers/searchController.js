const Search = require("../models/searchModel.js");
const globalSearch = async (req, res) => {
  try {
    const { data, error } = await Search.globalSearch(req, res);
    if (error) throw error;
    res.status(200).json({
      data: data,
      message: "documenti ottenuti con successo",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante la ricerca",
      details: error.message,
    });
  }
};
module.exports = { globalSearch };
