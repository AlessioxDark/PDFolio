import React, { useEffect, useState, useRef } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FolderIcon,
  AlertCircleIcon,
  Loader2Icon,
  ChevronDownIcon,
  FileTextIcon,
  XIcon,
} from "lucide-react";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import { useApi } from "@/contexts/ApiContext";

interface EditDocumentDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  documentId: string;
  currentNome: string;
  currentFolderId: string | null;
  defaultMode?: "edit" | "move";
  tags: string[];
}

const EditDocumentDialog = ({
  isOpen,
  setIsOpen,
  documentId,
  currentNome,
  currentFolderId,
  defaultMode = "edit",
  tags,
}: EditDocumentDialogProps) => {
  const [nome, setNome] = useState("");
  const [currentTags, setCurrentTags] = useState(tags);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const { error: apiError } = useApi();
  const { foldersData, handlePdfUpdate } = useDocumentsAndFolders();
  const inputRef = useRef<HTMLInputElement>(null);

  // Pulisci il nome dall'estensione per visualizzarlo meglio, ma se non ha .pdf lo tiene
  const formatNameForInput = (name: string) => {
    return name.replace(/\.pdf$/i, "");
  };

  useEffect(() => {
    if (isOpen) {
      setNome(formatNameForInput(currentNome));
      setFolderId(currentFolderId);
      setErrorMessage(null);

      // Focus automatico sul campo nome se in modalità rinomina
      if (defaultMode === "edit") {
        setTimeout(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        }, 150);
      }
    }
  }, [isOpen, currentNome, currentFolderId, defaultMode]);
  useEffect(() => {
    if (apiError?.update_pdf) {
      setErrorMessage(apiError.update_pdf.message);
    }
  }, [apiError]);
  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErrorMessage("Il nome del documento non può essere vuoto.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const finalName = nome.trim();

    const response = await handlePdfUpdate(documentId, {
      nome: finalName,
      folder_id: folderId,
      tags: currentTags,
    });

    if (response.success) {
      // Se ha successo, chiudiamo il modal e resettiamo il loading
      setIsOpen(false);
      setIsSaving(false);
    } else {
      setErrorMessage(
        response.error?.message ||
          "Impossibile aggiornare il documento. Riprova.",
      );
      setIsSaving(false);
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

  const removeTag = (indexToRemove: number) => {
    setCurrentTags((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (isSaving) return;
        setIsOpen(open);
      }}
    >
      <AlertDialogContent className="max-w-[440px] p-6 dark:bg-zinc-900 dark:border-zinc-800 rounded-2xl bg-white border border-neutral-200/60 shadow-2xl gap-0 font-sans">
        <AlertDialogHeader className="pb-4">
          <AlertDialogTitle className="text-xl font-bold text-neutral-900 dark:text-zinc-100 tracking-tight">
            {defaultMode === "edit" ? "Modifica Documento" : "Sposta Documento"}
          </AlertDialogTitle>
          <p className="text-xs text-neutral-400 dark:text-zinc-500 mt-0.5">
            {defaultMode === "edit"
              ? "Modifica il nome del file o i tag"
              : "Sposta il documento in una cartella"}
          </p>
        </AlertDialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* NOME DOCUMENTO */}
          {defaultMode == "edit" && (
            <div className="flex flex-col gap-2">
              <label className="font-inter text-[11px] font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider block">
                Nome Documento
              </label>

              <input
                ref={inputRef}
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={isSaving}
                placeholder="Es. Dispensa di Economia"
                className="w-full rounded-xl border border-neutral-200 dark:border-zinc-800 p-3 text-sm font-semibold text-neutral-800 dark:text-zinc-200 bg-white dark:bg-zinc-950/20 placeholder-neutral-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-accent dark:focus:ring-purple-500 focus:border-accent dark:focus:border-purple-500 transition-all"
              />
              <label className="font-inter text-[11px] font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider block">
                Tags Documento
              </label>
              <div className="w-full flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 dark:border-zinc-800 p-2 bg-white dark:bg-zinc-950/20 focus-within:ring-1 focus-within:ring-accent dark:focus-within:ring-purple-500 focus-within:border-accent dark:focus-within:border-purple-500 transition-all min-h-[46px]">
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
          )}

          {/* SELEZIONE CARTELLA */}
          {defaultMode == "move" && (
            <div className="flex flex-col gap-2">
              <label className="font-inter text-[11px] font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider block">
                Cartella di Destinazione
              </label>
              <div className="relative">
                <select
                  value={folderId || ""}
                  onChange={(e) => setFolderId(e.target.value || null)}
                  disabled={isSaving}
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
                  <ChevronDownIcon size={16} />
                </div>
              </div>
            </div>
          )}

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100/80 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium animate-in fade-in duration-200">
              <AlertCircleIcon size={15} className="shrink-0 mt-0.5" />
              <span className="leading-normal">{errorMessage}</span>
            </div>
          )}
        </div>

        {/* CONTROLLI DI FOOTER */}
        <div className="pt-4 border-t border-neutral-100 dark:border-zinc-800 mt-4 flex flex-row sm:justify-end gap-2.5">
          <AlertDialogCancel
            onClick={() => setIsOpen(false)}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-5 h-11 bg-neutral-50 dark:bg-zinc-800 hover:bg-neutral-100 dark:hover:bg-zinc-700 border border-neutral-200 dark:border-zinc-700 text-neutral-600 dark:text-zinc-300 hover:text-neutral-900 dark:hover:text-zinc-100 font-semibold rounded-xl cursor-pointer transition-colors text-sm"
          >
            Annulla
          </AlertDialogCancel>
          <button
            onClick={handleSave}
            disabled={!nome.trim() || isSaving}
            className="flex-1 sm:flex-none px-5 h-11 bg-accent dark:bg-purple-600 hover:bg-accent/90 dark:hover:bg-purple-500 border-none text-white font-bold rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm shadow-md shadow-accent/10"
          >
            {isSaving ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2Icon size={18} className="animate-spin" />
                Salvataggio...
              </div>
            ) : (
              "Salva"
            )}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditDocumentDialog;
