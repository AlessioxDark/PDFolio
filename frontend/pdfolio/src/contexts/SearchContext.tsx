import { apiCalls } from "@/services/api";
import React, {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

const SearchContext = createContext({
  globalSearchData: [],
  isGlobalQueryLoading: false,
  handleGlobalSearch: (query: string) => {},
  setCurrentFilter: (filter: string) => {},
  currentFilter: "",
});
export const useSearch = () => {
  const context = useContext(SearchContext);
  return context;
};

export const SearchContextProvider = ({ children }) => {
  const [globalSearchData, setGlobalSearchData] = useState({
    foldersData: [],
    documentsData: [],
    notesData: [],
    textData: [],
  });
  const [currentFilter, setCurrentFilter] = useState("");
  const [isGlobalQueryLoading, setIsGlobalQueryLoading] = useState(false);
  const { session } = useAuth();

  const handleGlobalSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsGlobalQueryLoading(true);
    try {
      const response = await apiCalls.home.globalSearch(
        session?.access_token,
        query,
      );

      if (response.error) {
        console.error("Errore nel caricamento:", response.error);
        // Ripristina la struttura vuota in caso di errore
        setGlobalSearchData({
          foldersData: [],
          documentsData: [],
          notesData: [],
          textData: [],
        });
      } else if (response.data) {
        console.log("Dati ricevuti nel Context:", response.data);
        setGlobalSearchData(response.data);
      }
    } catch (err) {
      console.error("Errore di rete:", err);
    } finally {
      setIsGlobalQueryLoading(false);
    }
  };

  const filteredSearchData = useMemo(() => {
    if (!currentFilter) {
      return globalSearchData;
    }

    if (currentFilter === "Recenti") {
      const adesso = new Date();
      let limiteTemporale: Date | null = null;
      limiteTemporale = new Date(adesso.getTime() - 1 * 24 * 60 * 60 * 1000);
      const filteredDocs = globalSearchData.documentsData.filter((doc: any) => {
        const dataDoc = new Date(doc.edited_at); // Adatta la colonna al tuo DB
        return limiteTemporale ? dataDoc >= limiteTemporale : true;
      });

      // Filtra le note (se vuoi applicare il filtro temporale anche a loro)
      const filteredNotes = globalSearchData.notesData.filter((note: any) => {
        const dataNota = new Date(note.updated_at);
        return limiteTemporale ? dataNota >= limiteTemporale : true;
      });

      // Ordina i risultati per i più recenti
      filteredDocs.sort(
        (a: any, b: any) =>
          new Date(b.updated_at || b.edited_at).getTime() -
          new Date(a.updated_at || a.edited_at).getTime(),
      );

      return {
        foldersData: globalSearchData.foldersData, // 👈 Cruciale: Quando c'è un filtro temporale attivo, svuotiamo le cartelle
        documentsData: filteredDocs,
        notesData: filteredNotes,
        textData: globalSearchData.textData, // Puoi lasciare o filtrare anche i testi estratti
      };
    } else if (currentFilter === "Note") {
      return {
        foldersData: [],
        documentsData: [],
        notesData: globalSearchData.notesData.filter((n) => n.type == "NOTE"),
        textData: [],
      };
    } else if (currentFilter === "Evidenziazioni") {
      return {
        foldersData: [],
        documentsData: [],
        notesData: globalSearchData.notesData.filter(
          (n) => n.type == "HIGHLIGHT",
        ),
        textData: [],
      };
    } else if (currentFilter === "Documenti") {
      return {
        foldersData: [],
        documentsData: globalSearchData.documentsData,
        notesData: [],
        textData: [],
      };
    }

    // Filtra i documenti in base alla data di modifica (updated_at o edited_at)
  }, [globalSearchData, currentFilter]);
  return (
    <SearchContext.Provider
      value={{
        globalSearchData: filteredSearchData,
        isGlobalQueryLoading,
        handleGlobalSearch,
        setGlobalSearchData,
        currentFilter,
        setCurrentFilter,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
