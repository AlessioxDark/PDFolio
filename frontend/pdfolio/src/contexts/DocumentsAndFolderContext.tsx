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

const DocumentsAndFolderContext = createContext({
  documentsData: [],
  foldersData: [],
  setDocumentsData: (arg) => {},
  setFoldersData: (arg) => {},
  handlePdfUpdate: async (
    documentId: string,
    updatedFields: { nome?: string; folder_id?: string | null },
  ) => ({ success: false }),
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
  const [activeFolder, setActiveFolder] = useState(null);
  const [documentsData, setDocumentsData] = useState([]);
  const [foldersData, setFoldersData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unorganizedFolderData, setUnorganizedFolderData] = useState({
    folder_id: null,
    nome: "Non Organizzati",
    documenti: [],
    colors: {
      bg: "bg-gray-400 hover:bg-gray-400/85",
      text: "text-gray-700 group-hover:text-gray-700/85",
    },
  });
  const { session } = useAuth();
  const loadDocumentsAndFolders = async () => {
    console.log("chiamo", session);
    if (!session) return;
    console.log("chiamo pt2");
    setIsLoading(true);
    const { data, error } = await apiCalls.home.getHomeFoldersAndFiles(session);
    if (error) {
      setIsLoading(false);
      console.error("Errore nel caricamento:", error);
      return;
    }
    if (data) {
      setIsLoading(false);
      console.log("Dati ricevuti:", data);
      const cartelleColorate = (data.foldersData || []).map((folderData) => {
        return {
          ...folderData,
          colors: FolderColors[folderData.color_index],
        };
      });
      const documenti = data.documentsData || [];

      setFoldersData(cartelleColorate);
      setDocumentsData(documenti);

      setUnorganizedFolderData((prev) => ({
        ...prev,
        documenti: documenti.filter((doc) => doc.folder_id === null),
      }));
    }
  };
  const handlePdfDelete = async (documentId: string) => {
    const { data, error } = await apiCalls.pdf.deletePdfFile(
      session,
      documentId,
    );
    if (error) console.error("ERRORE", error);
    if (data) {
      console.log("DATA", data);
      setDocumentsData((prev) =>
        prev.filter((doc) => doc.document_id !== documentId),
      );
      setUnorganizedFolderData((prev) => {
        const filteredDocs = prev.documenti.filter(
          (doc) => doc.document_id !== documentId,
        );
        return {
          ...prev,
          documenti: filteredDocs,
        };
      });
      setFoldersData((prev) =>
        prev.map((folder) => {
          return {
            ...folder,
            documenti: folder.documenti.filter(
              (doc) => doc.document_id !== documentId,
            ),
          };
        }),
      );
      toast("Il file è stato eliminato");

      // setTimeout(() => {
      //   navigate(-1);
      // }, 100);
    }
  };
  const handlePdfUpdate = async (
    documentId: string,
    updatedFields: { nome?: string; folder_id?: string | null },
  ) => {
    const { data, error } = await apiCalls.pdf.updatePdf(
      session,
      documentId,
      updatedFields,
    );
    if (error) {
      console.error("ERRORE AGGIORNAMENTO PDF", error);
      toast.error(
        error.message || "Errore durante l'aggiornamento del documento",
      );
      return { success: false, error };
    }
    if (data) {
      const prevFolderId = documentsData.find(
        (doc) => doc.document_id === documentId,
      )?.folder_id;
      console.log("PDF AGGIORNATO DATA:", data);
      const updatedDoc = data;

      // Update documentsData list
      setDocumentsData((prev) =>
        prev.map((doc) =>
          doc.document_id === documentId ? { ...doc, ...updatedDoc } : doc,
        ),
      );
      if (prevFolderId === null || prevFolderId === undefined) {
        // Era in "Non organizzati", lo togliamo da lì
        setUnorganizedFolderData((prev) => ({
          ...prev,
          documenti: (prev?.documenti || []).filter(
            (doc) => doc.document_id !== documentId,
          ),
        }));
      } else {
        // Era in una cartella, lo togliamo da quella cartella
        setFoldersData((prev) =>
          prev.map((folder) =>
            folder.folder_id === prevFolderId
              ? {
                  ...folder,
                  documenti: (folder.documenti || []).filter(
                    (doc) => doc.document_id !== documentId,
                  ),
                }
              : folder,
          ),
        );
      }

      if (updatedDoc.folder_id === null) {
        // Va in "Non organizzati"
        setUnorganizedFolderData((prev) => ({
          ...prev,
          documenti: [
            ...(prev?.documenti || []).filter(
              (doc) => doc.document_id !== documentId,
            ),
            updatedDoc,
          ],
        }));
      } else {
        // Va in una cartella reale
        setFoldersData((prev) =>
          prev.map((folder) =>
            folder.folder_id === updatedDoc.folder_id
              ? {
                  ...folder,
                  documenti: [
                    ...(folder.documenti || []).filter(
                      (doc) => doc.document_id !== documentId,
                    ),
                    updatedDoc,
                  ],
                }
              : folder,
          ),
        );
      }

      // 2. Rimuovi e aggiungi in foldersData

      // 3. Rinfresca activeFolder se presente+

      if (activeFolder?.folder_id == prevFolderId) {
        setActiveFolder((prev) => {
          const docs = (prev.documenti || []).filter(
            (doc) => doc.document_id !== documentId,
          );

          return {
            ...prev,
            documenti: docs,
          };
        });
      }

      return { success: true };
    }
    return { success: false };
  };
  useEffect(() => {
    loadDocumentsAndFolders();
  }, [session]);

  useEffect;
  return (
    <DocumentsAndFolderContext.Provider
      value={{
        documentsData,
        foldersData,
        isLoading,
        setDocumentsData,
        setFoldersData,
        unorganizedFolderData,
        activeFolder,
        handlePdfDelete,
        handlePdfUpdate,
        setActiveFolder,
        setUnorganizedFolderData,
        FolderColors,
      }}
    >
      {children}
    </DocumentsAndFolderContext.Provider>
  );
};
