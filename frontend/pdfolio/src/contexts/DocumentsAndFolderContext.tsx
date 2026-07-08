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
import { ApiContext, useApi } from "./ApiContext";

const DocumentsAndFolderContext = createContext({
  documentsData: [],
  foldersData: [],
  setDocumentsData: (arg) => {},
  setFoldersData: (arg) => {},
  handlePdfUpdate: async (
    documentId: string,
    updatedFields: {
      nome?: string;
      folder_id?: string | null;
      tags?: string[];
    },
  ) => ({ success: false }),
});
export const useDocumentsAndFolders = () => {
  const context = useContext(DocumentsAndFolderContext);
  return context;
};
const FolderColors = [
  {
    bg: "bg-blue-400 hover:bg-blue-400/85 dark:bg-blue-900 dark:hover:bg-blue-900/60 border border-transparent dark:border-blue-900/30",
    text: "text-blue-700 group-hover:text-blue-700/85 dark:text-blue-500 dark:group-hover:text-blue-600",
  },
  {
    bg: "bg-fuchsia-400 hover:bg-fuchsia-400/85 dark:bg-fuchsia-900 dark:hover:bg-fuchsia-900/60 border border-transparent dark:border-fuchsia-900/30",
    text: "text-fuchsia-700 group-hover:text-fuchsia-700/85 dark:text-fuchsia-500 dark:group-hover:text-fuchsia-600",
  },
  {
    bg: "bg-rose-400 hover:bg-rose-400/85 dark:bg-rose-900 dark:hover:bg-rose-900/60 border border-transparent dark:border-rose-900/30",
    text: "text-rose-700 group-hover:text-rose-700/85 dark:text-rose-500 dark:group-hover:text-rose-600",
  },
  {
    bg: "bg-sky-400 hover:bg-sky-400/85 dark:bg-sky-900 dark:hover:bg-sky-900/60 border border-transparent dark:border-sky-900/30",
    text: "text-sky-700 group-hover:text-sky-700/85 dark:text-sky-500 dark:group-hover:text-sky-600",
  },
  {
    bg: "bg-green-400 hover:bg-green-400/85 dark:bg-green-900 dark:hover:bg-green-900/60 border border-transparent dark:border-green-900/30",
    text: "text-green-700 group-hover:text-green-700/85 dark:text-green-500 dark:group-hover:text-green-600",
  },
  {
    bg: "bg-amber-400 hover:bg-amber-400/85 dark:bg-amber-900 dark:hover:bg-amber-900/60 border border-transparent dark:border-amber-900/20",
    text: "text-amber-700 group-hover:text-amber-700/85 dark:text-amber-500 dark:group-hover:text-amber-600",
  },
];

export const DocumentsAndFoldersContextProvider = ({ children }) => {
  const [activeFolder, setActiveFolder] = useState(null);
  const [documentsData, setDocumentsData] = useState([]);
  const [foldersData, setFoldersData] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  const [tagsList, setTagsList] = useState([]);

  const { executeApiCall } = useApi();
  const [unorganizedFolderData, setUnorganizedFolderData] = useState({
    folder_id: null,
    nome: "Non Organizzati",
    documenti: [],
    colors: {
      bg: "bg-gray-400 hover:bg-gray-400/85 dark:bg-gray-800  dark:hover:bg-gray-800/60 border border-transparent  dark:border-gray-900/30",
      text: "text-gray-700  group-hover:text-gray-700/85 dark:text-gray-500 dark:group-hover:text-gray-600",
    },
  });
  const { session } = useAuth();
  const loadDocumentsAndFolders = async () => {
    if (!session) return;
    const onSuccess = (data) => {
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
    };
    await executeApiCall(
      "home",
      () => {
        return apiCalls.home.getHomeFoldersAndFiles(session);
      },
      { onSuccess, onError: (e) => console.log("erroe frontend", e) },
    );
  };
  const handleTrashFile = async (documentId: string) => {
    const onSuccess = (data) => {
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
    };

    await executeApiCall(
      "trash_pdf_file",
      () => {
        return apiCalls.pdf.trashPdfFile(session, documentId);
      },
      {
        onSuccess,
        onError: (error) => {
          toast.error(error?.message);
        },
      },
    );
  };
  const handlePdfUpdate = async (
    documentId: string,
    updatedFields: { nome?: string; folder_id?: string | null },
  ) => {
    return new Promise(async (resolve) => {
      const onSuccess = (data) => {
        const prevFolderId = documentsData.find(
          (doc) => doc.document_id === documentId,
        )?.folder_id;
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

        if (activeFolder) {
          setActiveFolder((prev) => {
            if (!prev) return prev;

            if (activeFolder.folder_id === updatedDoc.folder_id) {
              return {
                ...prev,
                documenti: (prev.documenti || []).map((doc) =>
                  doc.document_id === documentId
                    ? { ...doc, ...updatedDoc }
                    : doc,
                ),
              };
            }

            if (activeFolder.folder_id === prevFolderId) {
              return {
                ...prev,
                documenti: (prev.documenti || []).filter(
                  (doc) => doc.document_id !== documentId,
                ),
              };
            }

            return prev;
          });
        }
        resolve({ success: true });
      };
      await executeApiCall(
        "update_pdf",
        () => {
          return apiCalls.pdf.updatePdf(session, documentId, updatedFields);
        },
        {
          onSuccess,
          onError: (e) => {
            resolve({ success: false, error: e });
          },
        },
      );
    });
  };
  useEffect(() => {
    loadDocumentsAndFolders();
  }, [session]);

  useEffect(() => {
    if (!documentsData && !foldersData) return;
    const allDocuments = [
      ...documentsData,
      ...foldersData?.flatMap((folder) => folder.documenti),
    ];
    const uniqueTags = [
      ...new Set(allDocuments.flatMap((doc) => doc.tags || [])),
    ];
    setTagsList(uniqueTags);
  }, [documentsData, foldersData]);

  useEffect;
  return (
    <DocumentsAndFolderContext.Provider
      value={{
        documentsData,
        foldersData,

        setDocumentsData,
        setFoldersData,
        unorganizedFolderData,
        activeFolder,
        handleTrashFile,
        handlePdfUpdate,
        setActiveFolder,
        activeTag,
        setActiveTag,
        setUnorganizedFolderData,
        FolderColors,
        tagsList,
        loadDocumentsAndFolders,
      }}
    >
      {children}
    </DocumentsAndFolderContext.Provider>
  );
};
