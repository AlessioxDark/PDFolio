const supabase = require("../config/db.js");
const crypto = require("crypto");
const { PDFDocument } = require("pdf-lib");
const getAll = async (req, res) => {
  try {
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
    const { data: noteSelect, error: noteError } = await supabase
      .from("note")
      .insert([{ ...noteData, user_id: user.id }])
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
    const rawFolderId = req.body.folder_id;
    const cleanFolderId =
      rawFolderId && rawFolderId.trim() !== "" && rawFolderId !== "null"
        ? rawFolderId
        : null;
    const { error: insertError } = await supabase.from("documenti").insert({
      document_id,
      nome: uploadedFile.originalname.replace(".pdf", ""),
      file_url: fileUrl,
      folder_id: cleanFolderId,
    });
    if (insertError) throw insertError;

    // carichiamo pagine sul db per ricerca
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const uint8ArrayData = new Uint8Array(uploadedFile.buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8ArrayData });
    const pdfDoc = await loadingTask.promise;
    const totalPages = pdfDoc.numPages;

    const pagesData = [];

    async function extractTextFromPage(pdf, pageNumber) {
      try {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();

        // Unisce i frammenti di testo della pagina inserendo uno spazio
        return textContent.items.map((item) => item.str).join(" ");
      } catch (error) {
        console.error(
          `Errore durante l'estrazione del testo dalla pagina ${pageNumber}:`,
          error,
        );
        return "";
      }
    }

    for (let i = 0; i < totalPages; i++) {
      const pageNumber = i + 1;
      const pageText = await extractTextFromPage(pdfDoc, pageNumber);
      const cleanText = pageText.replace(/\s+/g, " ").trim();

      pagesData.push({
        document_id: document_id,
        page_number: pageNumber,
        text: cleanText,
        user_id: user.id,
      });
    }
    const { error: pagesError } = await supabase
      .from("pagine_documenti")
      .insert(pagesData);

    if (pagesError) throw pagesError;

    console.log(`[OK] Inserite correttamente ${totalPages} pagine nel DB.`);
    console.log("arrivato senza problemi alla fine");

    return { data: { success: true, document_id: document_id }, error: null };
  } catch (error) {
    console.error("=== CRASH MODELLO DOCUMENTI ===", error);
    return { data: null, error: error };
  }
};

const deletePdfFile = async (req) => {
  try {
    const { pdfId } = req.params;

    // 1. Rimuovi il documento dal database
    const { error: dbError } = await supabase
      .from("documenti")
      .delete()
      .eq("document_id", pdfId);

    if (dbError) throw dbError;
    const { data: bucketFiles, error: listError } = await supabase.storage
      .from("file_pdf") // Nome del tuo bucket
      .list(pdfId, {
        // Il percorso della "cartella" (l'ID del documento)
        limit: 1, // Numero massimo di file da ritornare
        offset: 0, // Per la paginazione
        sortBy: { column: "name", order: "asc" },
      });
    if (listError) throw listError;
    const pathToFile = `${pdfId}/${bucketFiles[0].name}`;

    // Cancella il file dal bucket
    const { error: deleteError } = await supabase.storage
      .from("file_pdf")
      .remove([pathToFile]);

    if (deleteError) throw deleteError;

    return { data: { success: true, deletedPdfId: pdfId }, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};

const updatePdf = async (req) => {
  try {
    const { pdfId } = req.params;
    const { nome, folder_id } = req.body;
    const cleanFolderId = folder_id && folder_id !== "null" ? folder_id : null;
    const { data, error } = await supabase
      .from("documenti")
      .update({
        edited_at: new Date(),
        folder_id: cleanFolderId,
        nome,
      })
      .eq("document_id", pdfId)
      .select("*");

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
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
  deletePdfFile,
  updatePdf,
};
