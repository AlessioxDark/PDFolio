const supabase = require("../config/db.cjs");
const crypto = require("crypto");
const puppeteer = require("puppeteer");
const { marked } = require("marked");
const getAll = async (req, res) => {
  try {
    const { user } = req;
    const { data: foldersData, error: foldersError } = await supabase
      .from("cartelle")
      .select("*,documenti(*)")
      .eq("user_id", user.id);
    if (foldersError) throw foldersError;
    const { data: documentsData, error: documentsError } = await supabase
      .from("documenti")
      .select("*,cartelle(nome,folder_id)")
      .eq("is_deleted", false)
      .eq("user_id", user.id);
    if (documentsError) throw documentsError;
    return { data: { documentsData, foldersData }, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};
const getSpecificDocument = async (req, res) => {
  try {
    const { pdfId } = req.params;
    const { user } = req;

    const { data: documentData, error: documentError } = await supabase
      .from("documenti")
      .select("*")
      .eq("document_id", pdfId)
      .eq("user_id", user.id)
      .single();
    if (documentError) throw documentError;

    if (documentData.user_id !== user.id) {
      return res.status(401).json({
        success: false,
        details: "",
        message:
          "Accesso negato. Non hai i permessi per visualizzare questo documento.",
      });
    }
    // if (documentData.user_id !== user.id) throw { message: "Accesso Negato" };
    const { data: aiData, error: aiError } = await supabase
      .from("messaggi_ai")
      .select("*")
      .eq("document_id", pdfId)
      .eq("user_id", user.id);

    if (aiError) throw aiError;

    return { data: { ...documentData, aiMessages: aiData }, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};
const getNotesByDocumentId = async (req, res) => {
  try {
    const { pdfId } = req.params;
    const { user } = req;
    const { data: documentData, error: documentError } = await supabase
      .from("note")
      .select("*")
      .eq("document_id", pdfId)
      .eq("user_id", user.id);
    if (documentError) throw documentError;
    return { data: documentData, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};
const addNote = async (req) => {
  try {
    const { noteData } = req.body;
    const { user } = req;
    const { data: noteSelect, error: noteError } = await supabase
      .from("note")
      .insert([{ ...noteData, user_id: user.id }])
      .select("*");

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
    const { user } = req;
    const { data: noteToDelete } = await supabase
      .from("note")
      .select("text, user_id")
      .eq("note_id", noteId)
      .eq("document_id", pdfId)
      .eq("user_id", user.id)
      .single();

    // 2. Elimina la nota dal database
    const { error: noteError } = await supabase
      .from("note")
      .delete()
      .eq("note_id", noteId)
      .eq("document_id", pdfId)
      .eq("user_id", user.id); // Sicurezza extra: cancella solo se la nota appartiene davvero a questo PDF

    if (noteError) throw noteError;

    // 3. Se recuperata con successo, resetta lo stato dei messaggi AI associati
    if (noteToDelete && noteToDelete.text) {
      const selectionText = noteToDelete.text;
      const userId = noteToDelete.user_id;

      const { data: messages } = await supabase
        .from("messaggi_ai")
        .select("message_id, selection_data")
        .eq("document_id", pdfId)
        .eq("user_id", userId)
        .not("selection_data", "is", null);

      if (messages && messages.length > 0) {
        const toReset = messages.filter((msg) => {
          try {
            const sd =
              typeof msg.selection_data === "string"
                ? JSON.parse(msg.selection_data)
                : msg.selection_data;
            return sd && sd.text === selectionText;
          } catch {
            return false;
          }
        });

        if (toReset.length > 0) {
          const resetPromises = toReset.map(async (msg) => {
            const sd =
              typeof msg.selection_data === "string"
                ? JSON.parse(msg.selection_data)
                : msg.selection_data;
            const updatedSd = {
              ...sd,
              isSaved: false,
              isModified: false,
              isRejected: false,
            };
            return supabase
              .from("messaggi_ai")
              .update({ selection_data: updatedSd })
              .eq("message_id", msg.message_id);
          });
          await Promise.all(resetPromises);
        }
      }
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};
const updateNote = async (req) => {
  try {
    const { pdfId, noteId } = req.params;
    const { updatedContent } = req.body;
    const { user } = req;
    // Aggiorna prima la nota base
    const { error: noteError } = await supabase
      .from("note")
      .update({
        content: updatedContent,
        updated_at: new Date(),
      })
      .eq("note_id", noteId)
      .eq("document_id", pdfId)
      .eq("user_id", user.id);

    if (noteError) throw noteError;

    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};

const uploadPdf = async (req) => {
  try {
    const document_id = crypto.randomUUID();
    const uploadedFile = req.file;
    const { user } = req;
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
    const rawTags = JSON.parse(req.body.tags);
    const cleanFolderId =
      rawFolderId && rawFolderId.trim() !== "" && rawFolderId !== "null"
        ? rawFolderId
        : null;
    const { error: insertError } = await supabase.from("documenti").insert({
      document_id,
      nome: uploadedFile.originalname.replace(".pdf", ""),
      file_url: fileUrl,
      folder_id: cleanFolderId,
      tags: rawTags,
      user_id: user.id,
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

    return {
      data: { success: true, document_id: document_id, file_url: fileUrl },
      error: null,
    };
  } catch (error) {
    return { data: null, error: error };
  }
};

const trashPdfFile = async (req) => {
  try {
    const { pdfId } = req.params;
    const { user } = req;
    // 1. Rimuovi il documento dal database
    const { error: dbError } = await supabase
      .from("documenti")
      .update({ is_deleted: true })
      .eq("document_id", pdfId)
      .eq("user_id", user.id);
    if (dbError) throw dbError;

    return { data: { success: true, deletedPdfId: pdfId }, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};
const deletePdfFile = async (req) => {
  try {
    const { pdfId } = req.params;
    const { user } = req;
    const { error: dbError } = await supabase
      .from("documenti")
      .delete()
      .eq("document_id", pdfId)
      .eq("user_id", user.id);
    if (dbError) throw dbError;

    const { data: bucketFiles, error: listError } = await supabase.storage
      .from("file_pdf")
      .list(pdfId, {
        limit: 1,
        offset: 0,
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
const restorePdfFile = async (req) => {
  try {
    const { pdfId } = req.params;
    const { user } = req;
    const { error } = await supabase
      .from("documenti")
      .update({ is_deleted: false })
      .eq("document_id", pdfId)
      .eq("user_id", user.id);
    if (error) throw error;
    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};
const updatePdf = async (req) => {
  try {
    const { pdfId } = req.params;
    const { nome, folder_id, tags } = req.body;
    const { user } = req;
    const cleanFolderId = folder_id && folder_id !== "null" ? folder_id : null;
    const { data, error } = await supabase
      .from("documenti")
      .update({
        edited_at: new Date(),
        folder_id: cleanFolderId,
        nome,
        tags,
      })
      .eq("document_id", pdfId)
      .eq("user_id", user.id)
      .select("*");

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};
const exportSummaryPdf = async (req, res) => {
  try {
    const { markdownContent } = req.body;
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    let cleanMarkdown = markdownContent;

    cleanMarkdown = cleanMarkdown
      .replace(/<export-summary[^>]*>\s*/gi, "")
      .replace(/\s*<\/export-summary>/gi, "");

    cleanMarkdown = cleanMarkdown.replace(
      /^(\d+\.\d+(?:\.\d+)?\s+.+)$/gm,
      "### $1",
    );
    cleanMarkdown = cleanMarkdown.replace(/^(\d+\.\s+.+)$/gm, "## $1");

    cleanMarkdown = cleanMarkdown.replace(/([^\n])\n(##+ )/g, "$1\n\n$2");
    cleanMarkdown = cleanMarkdown.replace(/(##+ .+) \n([^\n])/g, "$1\n\n$2");

    const htmlContent = marked.parse(cleanMarkdown);

    const fullHtml = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      
      <script>
        window.MathJax = {
          tex: { inlineMath: [['$', '$'], ['\\\\(', '\\\\)']], displayMath: [['$$', '$$']] },
          startup: { typeset: false }
        };
      </script>
      <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

    <style>
  @page { 
    size: A4; 
    margin: 25mm 22mm 25mm 22mm;
  }
  
  body { 
    font-family: 'Inter', sans-serif; 
    -webkit-print-color-adjust: exact; 
    print-color-adjust: exact; 
    color: #1e293b;
    background-color: #ffffff;
  }

  /* Evita interruzioni orribili a metà pagina */
  h1, h2, h3, p, li, table, tr { 
    page-break-inside: avoid; 
    break-inside: avoid; 
  }

  /* Stile Tipografico Editoriale */
  h1 {
    font-size: 26px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.03em;
    margin-bottom: 24px;
  }

  h2 {
    font-size: 18px;
    font-weight: 700;
    color: #1e3a8a; /* Blu Notte elegante per le macro sezioni */
    margin-top: 36px;
    margin-bottom: 14px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 6px;
  }

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a; /* Nero per i sotto-paragrafi */
    margin-top: 22px;
    margin-bottom: 8px;
  }

  p {
    font-size: 13px;
    line-height: 1.7;
    color: #334155;
    margin-bottom: 14px;
    text-align: justify;
  }

  /* Reset di sicurezza se l'AI usa liste per sbaglio, impedendo l'ammassamento */
  ol, ul {
    margin-top: 8px;
    margin-bottom: 16px;
    padding-left: 20px;
  }

  li {
    font-size: 13px;
    line-height: 1.7;
    color: #334155;
    margin-bottom: 8px;
  }

  /* Tabelle Professionali */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 24px 0;
    font-size: 12.5px;
  }

  th {
    background-color: #f8fafc;
    color: #475569;
    font-weight: 600;
    text-align: left;
    padding: 10px 12px;
    border-bottom: 2px solid #e2e8f0;
  }

  td {
    padding: 10px 12px;
    border-bottom: 1px solid #f1f5f9;
    color: #475569;
  }

  /* Fonti p.X discrete */
  .page-source {
    font-size: 11px;
    font-weight: 500;
    color: #94a3b8;
    background-color: #f8fafc;
    padding: 1px 4px;
    border-radius: 3px;
    border: 1px solid #e2e8f0;
    margin-left: 4px;
    display: inline-block;
  }
</style>
    </head>
    <body class="antialiased">
      
      <!-- Intestazione della dispensa fluttuante ma pulita -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-8 text-[11px] text-slate-400 font-medium tracking-wide">
        <div>PDFolio — Dispensa di Studio Personale</div>
        <div class="font-mono">DOCUMENTO PRO</div>
      </div>

      <!-- Contenuto del Markdown -->
      <div id="pdf-content">
        ${htmlContent}
      </div>

      <!-- Script per convertire i tag pagina in micro-fonti eleganti -->
      <script>
        const container = document.getElementById('pdf-content');
        container.innerHTML = container.innerHTML
          // Intercetta varie forme di (p. X), [P. X], ecc. e le trasforma nella classe sfumata
          .replace(/\\((?:p\\.|pagina)\\s?(\\d+)\\)/gi, '<span class="page-source">p. $1</span>')
          .replace(/\\[(?:p\\.|pagina)\\s?(\\d+)\\]/gi, '<span class="page-source">p. $1</span>')
          .replace(/\\b(?:p\\.|pagina)\\s?(\\d+)\\b/gi, '<span class="page-source">p. $1</span>');

        if (window.MathJax && window.MathJax.typeset) {
          window.MathJax.typeset();
        }
      </script>
    </body>
  </html>`;

    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
    });

    await browser.close();

    // 2. CONFIGURI GLI HEADER PER IL DOWNLOAD FORZATO
    res.setHeader("Content-Type", "application/pdf");
    // attachment forza il download nativo invece di aprirlo nel browser
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="riassunto-pdfolio.pdf"',
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    // Spedisci il flusso binario del file
    // 3. Spari il buffer direttamente nella risposta
    return res.end(pdfBuffer);
  } catch (err) {}
};
const getTrashDocuments = async (req, res) => {
  const { user } = req;

  try {
    const { data, error } = await supabase
      .from("documenti")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_deleted", true);

    if (error) throw error;

    return { data: data, error: null };
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
  trashPdfFile,
  updatePdf,
  exportSummaryPdf,
  getTrashDocuments,
  deletePdfFile,
  restorePdfFile,
};
