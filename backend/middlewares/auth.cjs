// Specifica l'estensione .cjs per far capire a Node dove andare
const supabase = require("../config/db.cjs");

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: "Accesso negato. Token mancante o formato non valido.",
      });
    }

    const token = authHeader.split(" ")[1];

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(403).json({
        success: false,
        status: 403,
        message: "Sessione scaduta o token non valido.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      success: false,
      message: "Errore interno durante la verifica dell'identità.",
    });
  }
};

module.exports = requireAuth;
