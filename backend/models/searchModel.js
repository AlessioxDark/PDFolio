const supabase = require("../config/db.cjs");
const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const { user } = req;

    const { data: foldersData, error: foldersError } = await supabase
      .from("cartelle")
      .select("*")
      .eq("user_id", user.id)
      .ilike("nome", `%${q}%`);

    if (foldersError) throw foldersError;

    const { data: documentsData, error: documentsError } = await supabase
      .from("documenti")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_deleted", false);
    if (documentsError) throw documentsError;

    const { data: rawNotesData, error: notesError } = await supabase
      .from("note")
      .select("*, documenti(nome)")
      .eq("user_id", user.id)
      .or(`content.ilike.%${q}%,text.ilike.%${q}%`);
    if (notesError) throw notesError;

    const notesData = rawNotesData.map((note) => ({
      ...note,
      nome_documento: note.documenti?.nome,
      page: note.position?.page,
    }));

    const { data: rawTextData, error: textError } = await supabase
      .from("pagine_documenti")
      .select("*, documenti(nome)")
      .eq("user_id", user.id)
      .ilike("text", `%${q}%`);
    if (textError) throw textError;

    const textData = rawTextData.map((h) => ({
      ...h,
      nome_documento: h.documenti?.nome,
    }));

    const qLower = q.toLowerCase();

    const filteredDocuments = documentsData?.filter((doc) => {
      // Se la barra di ricerca è vuota, mostra tutti i documenti
      if (!qLower) return true;

      // 1. Controlla se la parola è nel NOME del documento
      const matchNome = doc.nome?.toLowerCase().includes(qLower);

      // 2. Controlla se la parola è CONTENUTA in almeno uno dei TAG dell'array
      // (.some gira su tutto l'array di stringhe)
      const matchTags = doc.tags?.some((tag) =>
        tag?.toLowerCase().includes(qLower),
      );
      // Ritorna il documento se corrisponde al nome OPPURE ai tag (Filtro flessibile totale)
      return matchNome || matchTags;
    });
    return {
      data: {
        documentsData: filteredDocuments,
        foldersData,
        notesData,
        textData,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error: error };
  }
};
module.exports = {
  globalSearch,
};
