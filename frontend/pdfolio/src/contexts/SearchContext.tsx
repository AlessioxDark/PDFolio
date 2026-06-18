import { apiCalls } from "@/services/api";
import React, {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

const SearchContext = createContext({
  globalSearchData: [],
  isGlobalQueryLoading: false,
  handleGlobalSearch: (query: string) => {},
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

  return (
    <SearchContext.Provider
      value={{
        globalSearchData,
        isGlobalQueryLoading,
        handleGlobalSearch,
        setGlobalSearchData,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
