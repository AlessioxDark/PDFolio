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

const markMessagesAsSaved = async (req, res) => {
  try {
    const { data, error } = await Ai.markMessagesAsSaved(req, res);
    if (error) throw error;
    res.status(200).json({
      data: data,
      message: "Messaggi aggiornati con successo",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'aggiornamento dei messaggi AI",
      details: error.message,
    });
  }
};

const markMessageAsModified = async (req, res) => {
  try {
    const { data, error } = await Ai.markMessageAsModified(req, res);
    if (error) throw error;
    res.status(200).json({
      data: data,
      message: "Messaggio aggiornato con successo",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'aggiornamento del messaggio AI",
      details: error.message,
    });
  }
};

const markMessageAsRejected = async (req, res) => {
  try {
    const { data, error } = await Ai.markMessageAsRejected(req, res);
    if (error) throw error;
    res.status(200).json({
      data: data,
      message: "Messaggio scartato con successo",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante lo scarto del messaggio AI",
      details: error.message,
    });
  }
};

module.exports = {
  askAi,
  markMessagesAsSaved,
  markMessageAsModified,
  markMessageAsRejected,
};
