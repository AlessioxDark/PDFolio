const supabase = require("../config/db.js");

const { PDFDocument } = require("pdf-lib");
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
    const document_id = crypto.randomUUID();
    const uploadedFile = req.file;
    const pdfDoc = await PDFDocument.load(uploadedFile.buffer);
    const pages = pdfDoc.getPages();

    if (pages.length === 0) {
      throw { message: "Il documento PDF è vuoto." };
    }

    // --- NUOVO CONTROLLO OCR ROBUSTO ---
    let hasFonts = false;

    // 1. Controllo standard sulla prima pagina
    const firstPageResources = pages[0].node.Resources();
    if (firstPageResources && firstPageResources.get?.("Font")) {
      hasFonts = true;
    }

    // 2. Fallback: Controllo nel catalogo globale del PDF se il primo fallisce
    if (!hasFonts) {
      const form = pdfDoc.getForm();
      // Se il PDF ha dei campi di testo editabili o font registrati globalmente nel form
      if (form && form.getFields().length > 0) {
        hasFonts = true;
      }
    }

    // 3. Ultima spiaggia: Verifichiamo se esistono riferimenti a font indiretti nella struttura
    if (!hasFonts) {
      const context = pdfDoc.context;
      // Cerchiamo l'esplicita menzione di un oggetto di tipo /Font dentro la mappa dei nodi del PDF
      for (const [key, value] of context.indirectObjects.entries()) {
        if (value && value.toString().includes("/Font")) {
          hasFonts = true;
          break;
        }
      }
    }
    if (!hasFonts) {
      throw { message: "Il documento deve avere OCR integrato!" };
    }
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
