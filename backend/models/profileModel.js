const supabase = require("../config/db.js");
const getProfile = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    // 2. Controllo di sicurezza: l'header esiste ed è un token Bearer?
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Accesso negato. Token mancante o formato non valido.",
      });
    }
    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError) throw userError;
    const { data, error } = await supabase
      .from("utenti")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (error) throw error;
    return {
      data: { user_id: user.id, email: data.email, handle: data.handle },
      error: null,
    };
  } catch (error) {
    return { data: null, error: err };
  }
};

module.exports = {
  getProfile,
};
