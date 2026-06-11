import { apiCalls } from "@/services/api";
import React, {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

const DocumentsAndFolderContext = createContext({
  allDocumentsAndFoldersData: [],
  documentsData: [],
  foldersData: [],
  setAllDocumentsAndFoldersData: () => {},
  setDocumentsData: () => {},
  setFoldersData: () => {},
});
export const useDocumentsAndFolders = () => {
  const context = useContext(DocumentsAndFolderContext);
  return context;
};
const FolderColors = [
  {
    bg: "bg-blue-400 hover:bg-blue-400/85",
    text: "text-blue-700 group-hover:text-blue-700/85",
  },
  {
    bg: "bg-fuchsia-400 hover:bg-fuchsia-400/85",
    text: "text-fuchsia-700 group-hover:text-fuchsia-700/85",
  },
  {
    bg: "bg-rose-400 hover:bg-rose-400/85",
    text: "text-rose-700 group-hover:text-rose-700/85",
  },
  {
    bg: "bg-sky-400 hover:bg-sky-400/85",
    text: "text-sky-700 group-hover:text-sky-700/85",
  },
  {
    bg: "bg-green-400 hover:bg-green-400/85",
    text: "text-green-700 group-hover:text-green-700/85",
  },
  {
    bg: "bg-amber-400 hover:bg-amber-400/85",
    text: "text-amber-700 group-hover:text-amber-700/85",
  },
];
export const DocumentsAndFoldersContextProvider = ({ children }) => {
  const [allDocumentsAndFoldersData, setAllDocumentsAndFoldersData] = useState(
    [],
  );
  const [documentsData, setDocumentsData] = useState([]);
  const [foldersData, setFoldersData] = useState([]);
  const { session } = useAuth();
  const loadDocumentsAndFolders = async () => {
    console.log("chiamo");
    if (!session) return;
    const { data, error } = await apiCalls.home.getHomeFoldersAndFiles(session);
    if (error) {
      console.error("Errore nel caricamento:", error);
      return;
    }
    if (data) {
      console.log("Dati ricevuti:", data);
      const cartelleColorate = (data.foldersData || []).map(
        (folderData, folderIndex) => {
          const colorIndex = folderIndex % FolderColors.length;
          return {
            ...folderData,
            colors: FolderColors[colorIndex],
          };
        },
      );
      const documenti = data.documentsData || [];

      setFoldersData(cartelleColorate);
      setDocumentsData(documenti);

      setAllDocumentsAndFoldersData([...documenti, ...cartelleColorate]);
    }
  };

  useEffect(() => {
    loadDocumentsAndFolders();
  }, []);

  useEffect;
  return (
    <DocumentsAndFolderContext.Provider
      value={{
        allDocumentsAndFoldersData,
        documentsData,
        foldersData,
        setAllDocumentsAndFoldersData,
        setDocumentsData,
        setFoldersData,
      }}
    >
      {children}
    </DocumentsAndFolderContext.Provider>
  );
};
