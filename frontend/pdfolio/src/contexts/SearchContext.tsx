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
import { useApi } from "./ApiContext";

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
  const { session } = useAuth();
  const { executeApiCall } = useApi();
  const handleGlobalSearch = async (query: string) => {
    if (!query.trim()) return;

    executeApiCall(
      "global_search",
      () => {
        return apiCalls.home.globalSearch(session?.access_token, query);
      },
      {
        onSuccess: (data) => {
          setGlobalSearchData(data);
        },
        onError: (error) => {
          setGlobalSearchData({
            foldersData: [],
            documentsData: [],
            notesData: [],
            textData: [],
          });
        },
      },
    );
  };

  return (
    <SearchContext.Provider
      value={{
        globalSearchData,

        handleGlobalSearch,
        setGlobalSearchData,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
