const Ai = require("../models/aiModel.js");

const askAi = async (req, res) => {
  try {
    const { data, error } = await Ai.askAi(req, res);
    if (error) throw error;
    res.status(200).json({
      data: data,
      message: "Risposta generata con successo",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'interrogazione dell'assistente AI",
      details: error.message,
    });
  }
};

module.exports = {
  askAi,
};
