import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  FileTextIcon,
  XIcon,
  UploadCloudIcon,
  AlertCircleIcon,
  Loader2Icon,
  ChevronDownIcon,
} from "lucide-react";

import * as pdfjsLib from "pdfjs-dist";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import { apiCalls } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useApi } from "@/contexts/ApiContext";
import TagInput from "@/components/input/TagInput";
import { usePdfUpload } from "@/app/hooks/useUploadPdf";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const UploadDialog = ({
  icon,
  chosenFolder = null,
}: {
  icon: React.ReactNode;
  chosenFolder?: string | null;
}) => {
  useEffect(() => {
    if (chosenFolder && chosenFolder !== "UNORGANIZED") {
      setSelectedFolder(chosenFolder);
    }
  }, [chosenFolder]);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const {
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
  } = usePdfUpload({
    chosenFolder,
    onSuccessClose: () => setIsOpen(false),
  });
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (isWorking) return;
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
                  disabled={isWorking}
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
                disabled={isWorking}
                placeholder="Es. Dispensa di Economia"
                className="w-full rounded-xl border border-neutral-200 dark:border-zinc-800 p-3 text-sm font-semibold text-neutral-800 dark:text-zinc-200 bg-white dark:bg-zinc-950/20 placeholder-neutral-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-accent dark:focus:ring-purple-500 focus:border-accent dark:focus:border-purple-500 transition-all"
              />
            </div>
          )}

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
                  disabled={isWorking}
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

          <TagInput
            currentTags={currentTags}
            setCurrentTags={setCurrentTags}
            disabled={isWorking}
          />
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100/80 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium animate-in fade-in duration-200">
              {" "}
              <AlertCircleIcon size={15} className="shrink-0 mt-0.5" />
              <span className="leading-normal">{errorMessage}</span>
            </div>
          )}
        </div>
        <div className="pt-4 border-t border-neutral-100 dark:border-zinc-800 mt-4 flex flex-row sm:justify-end gap-2.5">
          {" "}
          <AlertDialogCancel
            id="btn-close-dialog"
            onClick={() => setIsOpen(false)}
            disabled={isWorking}
            className="flex-1 sm:flex-none px-5 h-11 bg-neutral-50 dark:bg-zinc-800 hover:bg-neutral-100 dark:hover:bg-zinc-700 border border-neutral-200 dark:border-zinc-700 text-neutral-600 dark:text-zinc-300 hover:text-neutral-900 dark:hover:text-zinc-100 font-semibold rounded-xl cursor-pointer transition-colors text-sm"
          >
            Annulla
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleInvia}
            disabled={!file || !documentName.trim() || isWorking}
            className="flex-1 sm:flex-none px-5 h-11 bg-accent dark:bg-purple-600 hover:bg-accent/90 dark:hover:bg-purple-500 border-none text-white font-bold rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm shadow-md shadow-accent/10"
          >
            {isWorking ? (
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
