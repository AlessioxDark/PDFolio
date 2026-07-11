const supabase = require("../config/db.cjs");
const AiOrchestrator = require("../orchestrators/aiOrchestrator.js");

const askAi = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { prompt, history, isExplaining, selection_data, notes } = req.body;
    if (!prompt) {
      return {
        data: null,
        error: new Error("Il prompt è obbligatorio."),
      };
    }

    const { user } = req;
    const ventiquattroOreFa = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();
    const { count: aiMessagesCount, error: aiMessagesError } = await supabase
      .from("messaggi_ai")
      .select("message_id", { count: "exact", head: true })
      .eq("role", "assistant")
      .gte("created_at", ventiquattroOreFa);

    if (aiMessagesError) throw aiMessagesError;

    if (aiMessagesCount && aiMessagesCount >= 10) {
      return res.status(401).json({
        success: false,
        details: "limit_reached",
        message:
          "Hai raggiunto il limite massimo di 10 messaggi nelle ultime 24 ore.",
      });
    }
    // Recupera le pagine del documento associate a questo utente
    const { data: pages, error: pagesError } = await supabase
      .from("pagine_documenti")
      .select("text, page_number")
      .eq("document_id", documentId)
      .eq("user_id", user.id)
      .order("page_number", { ascending: true });

    if (pagesError) throw pagesError;

    // Costruisci il contesto testuale unendo le pagine estratte
    let documentText = "";
    if (pages && pages.length > 0) {
      documentText = pages
        .map((page) => `[Pagina ${page.page_number}]:\n${page.text}`)
        .join("\n\n");
    } else {
      documentText = "[Nessun testo estratto per questo documento]";
    }
    // let responseText = "";
    let responseText = await AiOrchestrator.getChatResponse({
      history,
      documentText,
      prompt,
      isExplaining,
      notes,
    });

    let finalSelectionData = selection_data;

    // Se l'AI propone di modificare una nota esistente e non abbiamo già selection_data
    if (!finalSelectionData && responseText) {
      const modificaMatch = responseText.match(
        /<modifica-nota\s+note_id="([^"]+)"/,
      );
      if (modificaMatch) {
        const noteId = modificaMatch[1];
        // Cerca la nota nei dati inviati dal frontend (notes) o nel DB
        let targetNote = notes && notes.find((n) => n.note_id === noteId);
        if (!targetNote) {
          // Fallback: cerca nel database
          const { data: dbNote } = await supabase
            .from("note")
            .select("*")
            .eq("note_id", noteId)
            .single();
          if (dbNote) {
            targetNote = dbNote;
          }
        }

        if (targetNote) {
          finalSelectionData = {
            document_id: documentId,
            text: targetNote.text || targetNote.content,
            position: targetNote.position,
            isSaved: true,
            isRejected: false,
            isModified: false,
          };
        }
      }
    }

    const { error: insertError } = await supabase.from("messaggi_ai").insert([
      {
        role: "user",
        content: prompt,
        document_id: documentId,
        // selection_data,
        user_id: user.id,
      },
      {
        role: "assistant",
        content: responseText,
        document_id: documentId,
        selection_data: finalSelectionData,
        user_id: user.id,
      },
    ]);
    if (insertError) throw insertError;

    return {
      data: { response: responseText },
      error: null,
    };
  } catch (error) {
    return { data: null, error: error };
  }
};

const markMessagesAsSaved = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { selectionText } = req.body;
    const { user } = req;

    // Recupera tutti i messaggi con selection_data non nulla per quel documento
    const { data: messages, error: fetchError } = await supabase
      .from("messaggi_ai")
      .select("message_id, selection_data")
      .eq("document_id", documentId)
      .eq("user_id", user.id)
      .not("selection_data", "is", null);

    if (fetchError) throw fetchError;

    // Filtra i messaggi il cui selection_data.text corrisponde al testo selezionato
    const toUpdate = messages.filter((msg) => {
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

    if (toUpdate.length === 0) {
      return { data: { updated: 0 }, error: null };
    }

    const updatePromises = toUpdate.map(async (msg) => {
      const sd =
        typeof msg.selection_data === "string"
          ? JSON.parse(msg.selection_data)
          : msg.selection_data;
      const updatedSd = { ...sd, isSaved: true };
      return supabase
        .from("messaggi_ai")
        .update({ selection_data: updatedSd })
        .eq("message_id", msg.message_id);
    });

    await Promise.all(updatePromises);

    return { data: { updated: toUpdate.length }, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

const markMessageAsModified = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { selectionText } = req.body;
    const { user } = req;

    // Recupera tutti i messaggi con selection_data non nulla per quel documento
    const { data: messages, error: fetchError } = await supabase
      .from("messaggi_ai")
      .select("message_id, selection_data")
      .eq("document_id", documentId)
      .eq("user_id", user.id)
      .not("selection_data", "is", null);

    if (fetchError) throw fetchError;

    // Filtra i messaggi il cui selection_data.text corrisponde al testo selezionato
    const toUpdate = messages.filter((msg) => {
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

    if (toUpdate.length === 0) {
      return { data: { updated: 0 }, error: null };
    }

    const updatePromises = toUpdate.map(async (msg) => {
      const sd =
        typeof msg.selection_data === "string"
          ? JSON.parse(msg.selection_data)
          : msg.selection_data;
      const updatedSd = { ...sd, isModified: true };
      return supabase
        .from("messaggi_ai")
        .update({ selection_data: updatedSd })
        .eq("message_id", msg.message_id);
    });

    await Promise.all(updatePromises);

    return { data: { updated: toUpdate.length }, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

const markMessageAsRejected = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { selectionText } = req.body;
    const { user } = req;

    // Recupera tutti i messaggi con selection_data non nulla per quel documento
    const { data: messages, error: fetchError } = await supabase
      .from("messaggi_ai")
      .select("message_id, selection_data")
      .eq("document_id", documentId)
      .eq("user_id", user.id)
      .not("selection_data", "is", null);

    if (fetchError) throw fetchError;

    // Filtra i messaggi il cui selection_data.text corrisponde al testo selezionato
    const toUpdate = messages.filter((msg) => {
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

    if (toUpdate.length === 0) {
      return { data: { updated: 0 }, error: null };
    }

    const updatePromises = toUpdate.map(async (msg) => {
      const sd =
        typeof msg.selection_data === "string"
          ? JSON.parse(msg.selection_data)
          : msg.selection_data;
      const updatedSd = { ...sd, isRejected: true };
      return supabase
        .from("messaggi_ai")
        .update({ selection_data: updatedSd })
        .eq("message_id", msg.message_id);
    });

    await Promise.all(updatePromises);

    return { data: { updated: toUpdate.length }, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

module.exports = {
  askAi,
  markMessagesAsSaved,
  markMessageAsModified,
  markMessageAsRejected,
};
