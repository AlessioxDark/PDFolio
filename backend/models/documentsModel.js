const supabase = require("../config/db.js");
const getAll = async (req, res) => {
  try {
    // const { user_id, email, full_name, handle } = req.body;
    const { data: foldersData, error: foldersError } = await supabase
      .from("cartelle")
      .select("*,documenti(*)");
    if (foldersError) throw foldersError;
    const { data: documentsData, error: documentsError } = await supabase
      .from("documenti")
      .select("*,cartelle(nome,folder_id)");
    if (documentsError) throw documentsError;
    return { data: { documentsData, foldersData }, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};
const getSpecificDocument = async (req, res) => {
  try {
    const { pdfId } = req.params;
    const { data: documentData, error: documentError } = await supabase
      .from("documenti")
      .select("*")
      .eq("document_id", pdfId)
      .single();
    if (documentError) throw documentError;
    return { data: documentData, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};

module.exports = {
  getAll,
  getSpecificDocument,
};
