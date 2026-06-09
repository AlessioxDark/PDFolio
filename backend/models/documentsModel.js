const supabase = require("../config/db.js");
const crypto = require("crypto");
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
const getNotesByDocumentId = async (req, res) => {
  try {
    const { pdfId } = req.params;
    const { data: documentData, error: documentError } = await supabase
      .from("note")
      .select("*")
      .eq("document_id", pdfId);
    if (documentError) throw documentError;
    return { data: documentData, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};
const addNote = async (req) => {
  try {
    const { pdfId } = req.params;
    const { noteData } = req.body;
    console.log("notedata", noteData, req.body);
    const { data: noteSelect, error: noteError } = await supabase
      .from("note")
      .insert([noteData])
      .select("*");
    console.log("noteError", noteError);

    if (noteError) throw noteError;
    return {
      data: { success: true, noteId: noteSelect[0]?.note_id },
      error: null,
    };
  } catch (error) {
    return { data: null, error: error };
  }
};
const deleteNote = async (req) => {
  try {
    const { pdfId, noteId } = req.params;

    const { error: noteError } = await supabase
      .from("note")
      .delete()
      .eq("note_id", noteId)
      .eq("document_id", pdfId); // Sicurezza extra: cancella solo se la nota appartiene davvero a questo PDF

    if (noteError) throw noteError;
    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};
const updateNote = async (req) => {
  try {
    console.log("req", req.params);
    const { pdfId, noteId } = req.params;
    const { updatedContent } = req.body;

    // Aggiorna prima la nota base
    const { error: noteError } = await supabase
      .from("note")
      .update({
        content: updatedContent,
        updated_at: new Date(),
      })
      .eq("note_id", noteId)
      .eq("document_id", pdfId);

    if (noteError) throw noteError;

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("Errore nell'aggiornamento della nota:", error);
    return { data: null, error: error };
  }
};

const uploadPdf = async (req) => {
  try {
    console.log("oi");
    const uploadedFile = req.file;
    const document_id = crypto.randomUUID();

    const percorsoCompleto = `${document_id}/${uploadedFile.originalname}`;
    const { error: bucketError } = await supabase.storage
      .from("file_pdf")
      .upload(percorsoCompleto, uploadedFile.buffer, {
        contentType: uploadedFile.mimetype,
      });
    if (bucketError) throw bucketError;

    const { data: urlData } = supabase.storage
      .from("file_pdf")
      .getPublicUrl(percorsoCompleto);

    const fileUrl = urlData.publicUrl;

    const { error: insertError } = await supabase.from("documenti").insert({
      document_id,
      nome: uploadedFile.originalname,
      file_url: fileUrl,
    });
    if (insertError) throw insertError;
    console.log("arrivato senza problemi alla fine");
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("=== CRASH MODELLO DOCUMENTI ===", error);
    return { data: null, error: error };
  }
};
module.exports = {
  getAll,
  getSpecificDocument,
  getNotesByDocumentId,
  addNote,
  deleteNote,
  updateNote,
  uploadPdf,
};
