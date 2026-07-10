import { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/contexts/ApiContext";
import { apiCalls } from "@/services/api";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface UsePdfUploadProps {
  chosenFolder: string | null;
  onSuccessClose: () => void;
}

export const usePdfUpload = ({
  chosenFolder,
  onSuccessClose,
}: UsePdfUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState<string>("");
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentTags, setCurrentTags] = useState<string[]>([]);

  const {
    foldersData,
    setDocumentsData,
    setFoldersData,
    setUnorganizedFolderData,
    setActiveFolder,
    activeFolder,
  } = useDocumentsAndFolders();

  const { session } = useAuth();
  const { executeApiCall, loading } = useApi();

  const isWorking = isAnalyzing || loading.upload_pdf;

  // Sincronizza la cartella se passata come prop dal componente padre
  useEffect(() => {
    if (chosenFolder && chosenFolder !== "UNORGANIZED") {
      setSelectedFolder(chosenFolder);
    }
  }, [chosenFolder]);

  const uploadPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      if (
        selectedFile.type !== "application/pdf" &&
        !selectedFile.name.endsWith(".pdf")
      ) {
        setErrorMessage(
          "Formato non valido. L'applicazione accetta solo file .pdf",
        );
        return;
      }

      setFile(selectedFile);
      const nomeSenzaEstensione = selectedFile.name.replace(/\.[^/.]+$/, "");
      setDocumentName(nomeSenzaEstensione);
    }
  };

  const resetStato = () => {
    setFile(null);
    setDocumentName("");
    setSelectedFolder("");
    setErrorMessage(null);
    setIsAnalyzing(false);
    setCurrentTags([]);
  };

  const analizzaTestoPdf = async (fileTarget: File): Promise<boolean> => {
    const arrayBuffer = await fileTarget.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let testoEstratto = "";

    const pagineDaAnalizzare = Math.min(pdf.numPages, 3);

    for (let i = 1; i <= pagineDaAnalizzare; i++) {
      const pagina = await pdf.getPage(i);
      const contenutoTesto = await pagina.getTextContent();
      const stringhePagina = contenutoTesto.items
        .map((item: any) => item.str)
        .join("");
      testoEstratto += stringhePagina;
    }

    const testoPulito = testoEstratto.replace(/\s+/g, "").trim();
    return testoPulito.length >= 30;
  };

  const handleInvia = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!file || !documentName.trim()) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const hasOcr = await analizzaTestoPdf(file);

      if (!hasOcr) {
        setErrorMessage(
          "Questo PDF sembra essere una scansione d'immagine. PDFolio richiede documenti con testo digitale leggibile (OCR).",
        );
        setIsAnalyzing(false);
        return;
      }

      const fileRinominato = new File([file], `${documentName.trim()}.pdf`, {
        type: file.type,
      });
      const folderIdDestinazione = selectedFolder ? selectedFolder : null;

      const fileData = new FormData();
      fileData.append("pdfFile", fileRinominato);
      fileData.append("folder_id", selectedFolder || "");
      fileData.append("tags", JSON.stringify(currentTags));

      await executeApiCall(
        "upload_pdf",
        () => apiCalls.pdf.uploadPdfFile(session?.access_token, fileData),
        {
          onSuccess: (data) => {
            const newDocument = {
              document_id: data.document_id,
              nome: fileRinominato.name,
              file_url: data.file_url,
              folder_id: folderIdDestinazione,
              created_at: new Date().toISOString(),
              edited_at: new Date().toISOString(),
              tags: currentTags,
            };

            setDocumentsData((prev) => [...prev, newDocument]);

            if (!folderIdDestinazione) {
              setUnorganizedFolderData((prev) => {
                const documentiPreesistenti = prev?.documenti || [];
                return {
                  ...prev,
                  documenti: [...documentiPreesistenti, newDocument],
                };
              });
            } else {
              setFoldersData((prev) =>
                prev.map((folder) => {
                  if (
                    String(folder.folder_id) === String(folderIdDestinazione)
                  ) {
                    return {
                      ...folder,
                      documenti: [...(folder.documenti || []), newDocument],
                    };
                  }
                  return folder;
                }),
              );
            }

            if (activeFolder) {
              setActiveFolder((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  documenti: [newDocument, ...(prev.documenti || [])],
                };
              });
            }

            toast.success("PDF caricato con successo");
            onSuccessClose();
            resetStato();
          },
          onError: (error) => {
            setErrorMessage(error?.message || "Errore durante il caricamento.");
          },
        },
      );
    } catch (err) {
      setErrorMessage("Errore durante l'elaborazione del file PDF.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    file,
    documentName,
    setDocumentName,
    selectedFolder,
    setSelectedFolder,
    currentTags,
    setCurrentTags,
    errorMessage,
    isWorking,
    foldersData,
    uploadPdf,
    resetStato,
    handleInvia,
  };
};
