const supabase = require("../config/db.js");
const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    console.log("query", q);
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

    const { data: foldersData, error: foldersError } = await supabase
      .from("cartelle")
      .select("*")
      .eq("user_id", user.id)
      .ilike("nome", `%${q}%`);
    if (foldersError) throw foldersError;

    const { data: documentsData, error: documentsError } = await supabase
      .from("documenti")
      .select("*")
      .eq("user_id", user.id)
      .ilike("nome", `%${q}%`);
    if (documentsError) throw documentsError;

    const { data: notesData, error: notesError } = await supabase
      .from("note")
      .select("*")
      .eq("user_id", user.id)
      .ilike("content", `%${q}%`);
    if (notesError) throw notesError;
    const { data: textData, error: textError } = await supabase
      .from("pagine_documenti")
      .select("*")
      .eq("user_id", user.id)
      .ilike("text", `%${q}%`);
    if (textError) throw textError;

    console.log("documentiData", documentsData);
    console.log("foldersData", foldersData);
    console.log("notesData", notesData);
    console.log("textData", textData);
    return {
      data: { documentsData, foldersData, notesData, textData },
      error: null,
    };
  } catch (error) {
    console.log("error", error);
    return { data: null, error: error };
  }
};
module.exports = {
  globalSearch,
};
