import React, { useState } from "react";
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
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const MOCK_FOLDERS = [
  { folder_id: "1", nome: "Università" },
  { folder_id: "2", nome: "Lavoro" },
  { folder_id: "3", nome: "Ricevute e Spese" },
];

const UploadDialog = ({ icon, folders = MOCK_FOLDERS, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState<string>("");
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

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

      if (onUpload) {
        await onUpload(fileRinominato, selectedFolder || null);
      }

      resetStato();
      document.getElementById("btn-close-dialog")?.click();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Errore durante l'analisi del file. Riprova con un altro PDF.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AlertDialog
      onOpenChange={(open) => {
        if (!open) resetStato();
      }}
    >
      <AlertDialogTrigger asChild>
        <div className="w-full h-full cursor-pointer">{icon}</div>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-[440px] p-6 rounded-2xl bg-white border border-neutral-200/60 shadow-2xl gap-0 font-sans">
        <AlertDialogHeader className="pb-4">
          <AlertDialogTitle className="text-xl font-bold text-neutral-900 tracking-tight">
            Importa Documento
          </AlertDialogTitle>
          <p className="text-xs text-neutral-400 mt-0.5">
            I documenti caricati verranno indicizzati per la ricerca full-text
            del grafo.
          </p>
        </AlertDialogHeader>

        <div className="flex flex-col gap-5 py-2">
          <div className="flex flex-col gap-2">
            <label className=" font-inter text-[11px] font-bold text-text-1 uppercase tracking-wider block">
              File
            </label>

            {file ? (
              <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-neutral-50/70 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-accent/10 text-accent rounded-xl shrink-0 shadow-sm">
                    <FileTextIcon size={18} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-neutral-800 truncate max-w-[240px]">
                      {file.name}
                    </span>
                    <span className="text-[11px] font-medium text-neutral-400 mt-0.5">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetStato}
                  disabled={isAnalyzing}
                  className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-xl transition-all cursor-pointer disabled:opacity-30"
                  title="Rimuovi file"
                >
                  <XIcon size={16} />
                </button>
              </div>
            ) : (
              <div className="w-full h-36 relative rounded-xl flex flex-col items-center justify-center cursor-pointer bg-neutral-50/40 border-2 border-dashed border-neutral-200 hover:border-accent hover:bg-accent/[0.02] transition-all gap-2 p-4 group">
                <input
                  type="file"
                  accept=".pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={uploadPdf}
                />
                <div className="p-3 bg-white rounded-xl shadow-sm text-neutral-400 group-hover:text-accent group-hover:scale-105 transition-all border border-neutral-100/80">
                  <UploadCloudIcon size={22} />
                </div>
                <div className="text-center flex flex-col gap-0.5">
                  <span className="text-neutral-800 text-sm font-semibold">
                    Seleziona un file PDF
                  </span>
                  <span className="text-neutral-400 text-xs">
                    Trascina qui il file o clicca per sfogliare
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* CAMPO NOME DOCUMENTO */}
          {file && (
            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className=" font-inter text-[11px] font-bold text-text-1 uppercase tracking-wider flex items-center gap-1.5">
                Nome Documento
              </label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                disabled={isAnalyzing}
                placeholder="Es. Dispensa di Economia"
                className="w-full rounded-xl border border-neutral-200 p-3 text-sm font-semibold text-neutral-800 bg-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent focus:ring-offset-0 transition-all"
              />
            </div>
          )}

          {/* SELEZIONE CARTELLA (Custom Select Stilizzato) */}
          <div className="flex flex-col gap-2">
            <label className=" font-inter text-[11px] font-bold text-text-1 uppercase tracking-wider flex items-center gap-1.5">
              Cartella di Destinazione
            </label>
            <div className="relative">
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                disabled={isAnalyzing}
                className="w-full appearance-none rounded-xl border border-neutral-200 p-3 pr-10 text-sm font-semibold text-neutral-800 bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:ring-offset-0 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  📦 Nessuna cartella (Salva in "Non organizzati")
                </option>
                {folders.map((folder) => (
                  <option key={folder.folder_id} value={folder.folder_id}>
                    📁 {folder.nome}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-neutral-400">
                <ChevronDownIcon size={16} />
              </div>
            </div>
          </div>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100/80 text-red-600 text-xs font-medium animate-in fade-in duration-200">
              <AlertCircleIcon size={15} className="shrink-0 mt-0.5" />
              <span className="leading-normal">{errorMessage}</span>
            </div>
          )}
        </div>

        {/* CONTROLLI DI FOOTER (Stili resettati e rifiniti) */}
        <div className="pt-4 border-t border-neutral-100 mt-4 flex flex-row sm:justify-end gap-2.5">
          <AlertDialogCancel
            id="btn-close-dialog"
            onClick={resetStato}
            disabled={isAnalyzing}
            className="flex-1 sm:flex-none px-5 h-11 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-600 hover:text-neutral-900 font-semibold rounded-xl cursor-pointer transition-colors text-sm"
          >
            Annulla
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleInvia}
            disabled={!file || !documentName.trim() || isAnalyzing}
            className="flex-1 sm:flex-none px-5 h-11 bg-accent hover:bg-accent/90 border-none text-white font-bold rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm shadow-md shadow-accent/10"
          >
            {isAnalyzing ? (
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
