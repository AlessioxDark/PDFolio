const supabase = require("../config/db.cjs");
const createFolder = async (req, res) => {
  try {
    const folderData = req.body;
    const { user } = req;

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
    const { user } = req;

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
