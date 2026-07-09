const supabase = require("../config/db.cjs");
const createFolder = async (req, res) => {
  try {
    const folderData = req.body;
    const authHeader = req.headers["authorization"];
    console.log("body", req.body);
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
    const { error: folderInsertError } = await supabase
      .from("cartelle")
      .insert([
        {
          nome: folderData.nome,
          color_index: folderData.color_index,
          user_id: user.id,
          folder_id: folderData.folder_id,
        },
      ]);
    if (folderInsertError) throw folderInsertError;
    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};
const deleteFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
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
    const { error: updateError } = await supabase
      .from("documenti")
      .update({ folder_id: null })
      .eq("folder_id", folderId);
    if (updateError) throw updateError;

    const { error: folderDeleteError } = await supabase
      .from("cartelle")
      .delete()
      .eq("folder_id", folderId)
      .eq("user_id", user.id);
    if (folderDeleteError) throw folderDeleteError;
    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};
module.exports = {
  createFolder,
  deleteFolder,
};
