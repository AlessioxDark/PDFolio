const Profile = require("../models/profileModel.js");
const getProfile = async (req, res) => {
  try {
    const { data, error } = await Profile.getProfile(req, res);
    if (error) throw error;
    res.status(200).json({
      data: data,
      message: "Profilo ottenuto con successo",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'ottenimento del profilo",
      details: error.message,
    });
  }
};

module.exports = {
  getProfile,
};
