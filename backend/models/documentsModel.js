const supabase = require("../config/db.js");
const getAll = async (req, res) => {
  try {
    // const { user_id, email, full_name, handle } = req.body;
    const { data: folderAndDocumentsData, error: folderAndDocumentsError } =
      await supabase.from("cartelle").select("*,documenti(*)");
    if (folderAndDocumentsError) throw folderAndDocumentsError;
    const { data: noteData, error: noteError } = await supabase
      .from("note")
      .select("*");
    if (noteError) throw noteError;
    return { data: { noteData, folderAndDocumentsData }, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};

module.exports = {
  getAll,
};
