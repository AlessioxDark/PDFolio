const supabase = require("../config/db.js");
const { GoogleGenAI } = require("@google/genai");
const { CohereClientV2 } = require("cohere-ai");
const { OpenAI } = require("openai");
const AiOrchestrator = require("../orchestrators/aiOrchestrator.js");

// Dentro il controller askAi:

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY,
});

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const askAi = async (req, res) => {
  try {
    console.log("ok");
    const { documentId } = req.params;
    const { prompt, history, isExplaining, selection_data, notes } = req.body;
    console.log("selection_Data", selection_data, req.body);
    if (!prompt) {
      return {
        data: null,
        error: new Error("Il prompt è obbligatorio."),
      };
    }

    const authHeader = req.headers["authorization"];
    // Controllo di sicurezza: l'header esiste ed è un token Bearer
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        data: null,
        error: new Error(
          "Accesso negato. Token mancante o formato non valido.",
        ),
      };
    }
    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError) throw userError;

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

    const { error: insertError } = await supabase.from("messaggi_ai").insert([
      {
        role: "user",
        content: prompt,
        document_id: documentId,
        user_id: user.id,
      },
      {
        role: "assistant",
        content: responseText,
        document_id: documentId,
        selection_data,
        user_id: user.id,
      },
    ]);
    if (insertError) throw insertError;

    console.log("risposta", responseText);
    return {
      data: { response: responseText },
      error: null,
    };
  } catch (error) {
    console.error("=== ERRORE NEL MODELLO AI ===", error);
    return { data: null, error: error };
  }
};

const markMessagesAsSaved = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { selectionText } = req.body;

    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { data: null, error: new Error("Token mancante o non valido.") };
    }
    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError) throw userError;

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
    console.error("=== ERRORE markMessagesAsSaved ===", error);
    return { data: null, error };
  }
};

const markMessageAsModified = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { selectionText } = req.body;

    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { data: null, error: new Error("Token mancante o non valido.") };
    }
    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError) throw userError;

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
    console.error("=== ERRORE markMessageAsModified ===", error);
    return { data: null, error };
  }
};

const markMessageAsRejected = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { selectionText } = req.body;

    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { data: null, error: new Error("Token mancante o non valido.") };
    }
    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError) throw userError;

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
    console.error("=== ERRORE markMessageAsRejected ===", error);
    return { data: null, error };
  }
};

module.exports = {
  askAi,
  markMessagesAsSaved,
  markMessageAsModified,
  markMessageAsRejected,
};
