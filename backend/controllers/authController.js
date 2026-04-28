const Auth = require("../models/authModel.js");
const SignUp = async (req, res) => {
  try {
    const { data, error } = await Auth.createProfile(req, res);
    if (error) throw error;
    res
      .status(200)
      .json({
        data: data,
        message: "Profilo creato con successo",
        success: true,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Errore durante la creazione del profilo nel DB",
        details: error.message,
      });
  }
};
module.exports = { SignUp };
