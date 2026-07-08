import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  FileTextIcon,
  FolderIcon,
  XIcon,
  UploadCloudIcon,
  AlertCircleIcon,
  Loader2Icon,
  TypeIcon,
  ChevronDownIcon,
} from "lucide-react";

import * as pdfjsLib from "pdfjs-dist";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import { apiCalls } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useApi } from "@/contexts/ApiContext";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const UploadDialog = ({ icon, chosenFolder }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { session } = useAuth();
  const [documentName, setDocumentName] = useState<string>("");
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const {
    foldersData,
    setDocumentsData,
    setFoldersData,
    setUnorganizedFolderData,
    setActiveFolder,
    activeFolder,
  } = useDocumentsAndFolders();

  const { executeApiCall, loading } = useApi();
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
      fileData.append("folder_id", selectedFolder || null);
      fileData.append("tags", JSON.stringify(currentTags));
      await executeApiCall(
        "upload_pdf",
        () => apiCalls.pdf.uploadPdfFile(session?.access_token, fileData),
        {
          onSuccess: (data) => {
            console.log("successo", data);
            const newDocument = {
              document_id: data.document_id,
              nome: fileRinominato.name,
              file_url: URL.createObjectURL(fileRinominato),
              folder_id: folderIdDestinazione,
              created_at: new Date().toISOString(),
              edited_at: new Date().toISOString(),
              tags: currentTags,
            };
            setDocumentsData((prev) => {
              return [...prev, newDocument];
            });
            if (!folderIdDestinazione) {
              // Caso: Non organizzati
              setUnorganizedFolderData((prev) => {
                const documentiPreesistenti = prev?.documenti || [];
                return {
                  ...prev,
                  documenti: [...documentiPreesistenti, newDocument],
                };
              });
            } else {
              // Caso: Cartella Specifica
              setFoldersData((prev) =>
                prev.map((folder) => {
                  const isTargetFolder =
                    String(folder.folder_id) === String(folderIdDestinazione);

                  if (isTargetFolder) {
                    const documentiPreesistenti = folder.documenti || [];
                    return {
                      ...folder,
                      documenti: [...documentiPreesistenti, newDocument],
                    };
                  }
                  return folder;
                }),
              );
            }
            if (activeFolder) {
              setActiveFolder((prev) => {
                return {
                  ...prev,
                  documenti: [newDocument, ...prev.documenti],
                };
              });
            }
            // aggiornare stato
            toast.success("PDF caricato con successo");
            setIsOpen(false);
            resetStato();
          },
          onError: (error) => {
            setErrorMessage(error?.message);
          },
        },
      );
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault(); // Evita l'invio di eventuali form nativi

      // Evitiamo tag duplicati
      if (!currentTags.includes(inputValue.trim())) {
        setCurrentTags((prev) => [...prev, inputValue.trim()]);
      }
      setInputValue("");
    } else if (
      e.key === "Backspace" &&
      inputValue === "" &&
      currentTags.length > 0
    ) {
      // Chicca UX: se premi Backspace e l'input è vuoto, cancella l'ultimo tag inserito
      setCurrentTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove) => {
    setCurrentTags((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (isAnalyzing) return;
        setIsOpen(open);
        if (!open) resetStato();
      }}
    >
      <AlertDialogTrigger asChild>
        <div className="w-full h-full cursor-pointer">{icon}</div>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-[440px] p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200/60 dark:border-zinc-800 shadow-2xl gap-0 font-sans transition-colors duration-300">
        {" "}
        <AlertDialogHeader className="pb-4">
          <AlertDialogTitle className="text-xl font-bold text-neutral-900 dark:text-zinc-100 tracking-tight">
            {" "}
            Importa Documento
          </AlertDialogTitle>
          <p className="text-xs text-neutral-400 dark:text-zinc-500 mt-0.5">
            {" "}
            I documenti caricati verranno indicizzati per la ricerca full-text
            del grafo.
          </p>
        </AlertDialogHeader>
        <div className="flex flex-col gap-5 py-2">
          <div className="flex flex-col gap-2">
            <label className="font-inter text-[11px] font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider block">
              {" "}
              File
            </label>

            {file ? (
              <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-neutral-50/70 dark:bg-zinc-950/50 transition-all">
                {" "}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-accent/10 dark:bg-purple-500/10 text-accent dark:text-purple-400 rounded-xl shrink-0 shadow-sm">
                    {" "}
                    <FileTextIcon size={18} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-neutral-800 dark:text-zinc-200 truncate max-w-[240px]">
                      {" "}
                      {file.name}
                    </span>
                    <span className="text-[11px] font-medium text-neutral-400 dark:text-zinc-500 mt-0.5">
                      {" "}
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetStato}
                  disabled={isAnalyzing}
                  className="p-2 text-neutral-400 dark:text-zinc-500 hover:text-neutral-900 dark:hover:text-zinc-200 hover:bg-neutral-200/60 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer disabled:opacity-30"
                  title="Rimuovi file"
                >
                  <XIcon size={16} />
                </button>
              </div>
            ) : (
              <div className="w-full h-36 relative rounded-xl flex flex-col items-center justify-center cursor-pointer bg-neutral-50/40 dark:bg-zinc-950/20 border-2 border-dashed border-neutral-200 dark:border-zinc-800 hover:border-accent dark:hover:border-purple-500 hover:bg-accent/[0.02] dark:hover:bg-purple-500/[0.01] transition-all gap-2 p-4 group">
                {" "}
                <input
                  type="file"
                  accept=".pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={uploadPdf}
                />
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm text-neutral-400 dark:text-zinc-500 group-hover:text-accent dark:group-hover:text-purple-400 group-hover:scale-105 transition-all border border-neutral-100/80 dark:border-zinc-800">
                  {" "}
                  <UploadCloudIcon size={22} />
                </div>
                <div className="text-center flex flex-col gap-0.5">
                  <span className="text-neutral-800 dark:text-zinc-200 text-sm font-semibold">
                    Seleziona un file PDF
                  </span>
                  <span className="text-neutral-400 dark:text-zinc-500 text-xs">
                    Trascina qui il file o clicca per sfogliare
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* CAMPO NOME DOCUMENTO */}
          {file && (
            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="font-inter text-[11px] font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                {" "}
                Nome Documento
              </label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                disabled={isAnalyzing}
                placeholder="Es. Dispensa di Economia"
                className="w-full rounded-xl border border-neutral-200 dark:border-zinc-800 p-3 text-sm font-semibold text-neutral-800 dark:text-zinc-200 bg-white dark:bg-zinc-950/20 placeholder-neutral-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-accent dark:focus:ring-purple-500 focus:border-accent dark:focus:border-purple-500 transition-all"
              />
            </div>
          )}

          {/* SELEZIONE CARTELLA (Custom Select Stilizzato) */}
          {!chosenFolder && (
            <div className="flex flex-col gap-2">
              <label className="font-inter text-[11px] font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                {" "}
                Cartella di Destinazione
              </label>
              <div className="relative">
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  disabled={isAnalyzing}
                  className="w-full appearance-none rounded-xl border border-neutral-200 dark:border-zinc-800 p-3 pr-10 text-sm font-semibold text-neutral-800 dark:text-zinc-200 bg-white dark:bg-zinc-950/20 focus:outline-none focus:border-accent dark:focus:border-purple-500 focus:ring-1 focus:ring-accent dark:focus:ring-purple-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" className="dark:bg-zinc-900">
                    📦 Nessuna cartella (Salva in "Non organizzati")
                  </option>
                  {foldersData.map((folder) => (
                    <option
                      key={folder.folder_id}
                      value={folder.folder_id}
                      className="dark:bg-zinc-900"
                    >
                      📁 {folder.nome}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-neutral-400 dark:text-zinc-500">
                  {" "}
                  <ChevronDownIcon size={16} />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="font-inter text-[11px] font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              Tags
            </label>
            <div className="w-full flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 dark:border-zinc-800 p-2 bg-white dark:bg-zinc-950/20 focus-within:ring-1 focus-within:ring-accent dark:focus-within:ring-purple-500 focus-within:border-accent dark:focus-within:border-purple-500 transition-all min-h-[46px]">
              {" "}
              {/* 🏷️ LISTA DELLE PILLOLE */}
              {currentTags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-neutral-100 dark:bg-zinc-900/20 text-neutral-800 dark:text-zinc-200 text-xs font-semibold px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-zinc-700 animate-in zoom-in-95 duration-150"
                >
                  <span>#{tag}</span>
                  <XIcon
                    onClick={() => removeTag(index)}
                    className="text-neutral-400 dark:text-zinc-500 hover:text-neutral-600 dark:hover:text-zinc-300 rounded-full hover:bg-neutral-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                    size={12}
                  />
                </div>
              ))}
              {/* ✍️ INPUT REALE: Nudo, senza bordi, si adatta allo spazio rimasto */}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentTags.length === 0 ? "Es. Economia" : ""}
                className="flex-1 min-w-[120px] bg-transparent text-sm font-semibold text-neutral-800 dark:text-zinc-200 focus:outline-none p-1 placeholder-neutral-400 dark:placeholder-zinc-600"
              />
            </div>
          </div>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100/80 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium animate-in fade-in duration-200">
              {" "}
              <AlertCircleIcon size={15} className="shrink-0 mt-0.5" />
              <span className="leading-normal">{errorMessage}</span>
            </div>
          )}
        </div>
        {/* CONTROLLI DI FOOTER (Stili resettati e rifiniti) */}
        <div className="pt-4 border-t border-neutral-100 dark:border-zinc-800 mt-4 flex flex-row sm:justify-end gap-2.5">
          {" "}
          <AlertDialogCancel
            id="btn-close-dialog"
            onClick={() => setIsOpen(false)}
            disabled={isAnalyzing}
            className="flex-1 sm:flex-none px-5 h-11 bg-neutral-50 dark:bg-zinc-800 hover:bg-neutral-100 dark:hover:bg-zinc-700 border border-neutral-200 dark:border-zinc-700 text-neutral-600 dark:text-zinc-300 hover:text-neutral-900 dark:hover:text-zinc-100 font-semibold rounded-xl cursor-pointer transition-colors text-sm"
          >
            Annulla
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleInvia}
            disabled={
              !file ||
              !documentName.trim() ||
              isAnalyzing ||
              loading?.upload_pdf
            }
            className="flex-1 sm:flex-none px-5 h-11 bg-accent dark:bg-purple-600 hover:bg-accent/90 dark:hover:bg-purple-500 border-none text-white font-bold rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm shadow-md shadow-accent/10"
          >
            {isAnalyzing || loading?.upload_pdf ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2Icon size={15} className="animate-spin" /> Verifico
                OCR...
              </span>
            ) : (
              "Salva"
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UploadDialog;
