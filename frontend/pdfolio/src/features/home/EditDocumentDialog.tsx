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
} from "lucide-react";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";

interface EditDocumentDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  documentId: string;
  currentNome: string;
  currentFolderId: string | null;
  defaultMode?: "rename" | "move";
}

const EditDocumentDialog = ({
  isOpen,
  setIsOpen,
  documentId,
  currentNome,
  currentFolderId,
  defaultMode = "rename",
}: EditDocumentDialogProps) => {
  const [nome, setNome] = useState("");
  const [folderId, setFolderId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      if (defaultMode === "rename") {
        setTimeout(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        }, 150);
      }
    }
  }, [isOpen, currentNome, currentFolderId, defaultMode]);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErrorMessage("Il nome del documento non può essere vuoto.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const finalName = nome.trim();

    try {
      const res = await handlePdfUpdate(documentId, {
        nome: finalName,
        folder_id: folderId,
      });

      if (res.success) {
        setIsOpen(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Errore imprevisto durante il salvataggio.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (isSaving) return;
        setIsOpen(open);
      }}
    >
      <AlertDialogContent className="max-w-[440px] p-6 rounded-2xl bg-white border border-neutral-200/60 shadow-2xl gap-0 font-sans">
        <AlertDialogHeader className="pb-4">
          <AlertDialogTitle className="text-xl font-bold text-neutral-900 tracking-tight">
            {defaultMode === "rename"
              ? "Rinomina Documento"
              : "Sposta Documento"}
          </AlertDialogTitle>
          <p className="text-xs text-neutral-400 mt-0.5">
            Modifica il nome del file o la cartella in cui si trova.
          </p>
        </AlertDialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* NOME DOCUMENTO */}
          {defaultMode == "rename" && (
            <div className="flex flex-col gap-2">
              <label className=" font-inter text-[11px] font-bold text-text-1 uppercase tracking-wider flex items-center gap-1.5">
                Nome Documento
              </label>
              <input
                ref={inputRef}
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={isSaving}
                placeholder="Es. Dispensa di Economia"
                className="w-full rounded-xl border border-neutral-200 p-3 text-sm font-semibold text-neutral-800 bg-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent focus:ring-offset-0 transition-all disabled:opacity-50"
              />
            </div>
          )}

          {/* SELEZIONE CARTELLA */}
          {defaultMode == "move" && (
            <div className="flex flex-col gap-2">
              <label className=" font-inter text-[11px] font-bold text-text-1 uppercase tracking-wider flex items-center gap-1.5">
                Cartella di Destinazione
              </label>
              <div className="relative">
                <select
                  value={folderId || ""}
                  onChange={(e) => setFolderId(e.target.value || null)}
                  disabled={isSaving}
                  className="w-full appearance-none rounded-xl border border-neutral-200 p-3 pr-10 text-sm font-semibold text-neutral-800 bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:ring-offset-0 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    📦 Nessuna cartella (Salva in "Non organizzati")
                  </option>
                  {foldersData.map((folder) => (
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
          )}

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100/80 text-red-600 text-xs font-medium animate-in fade-in duration-200">
              <AlertCircleIcon size={15} className="shrink-0 mt-0.5" />
              <span className="leading-normal">{errorMessage}</span>
            </div>
          )}
        </div>

        {/* CONTROLLI DI FOOTER */}
        <div className="pt-4 border-t border-neutral-100 mt-4 flex flex-row sm:justify-end gap-2.5">
          <AlertDialogCancel
            onClick={() => setIsOpen(false)}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-5 h-11 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-600 hover:text-neutral-900 font-semibold rounded-xl cursor-pointer transition-colors text-sm"
          >
            Annulla
          </AlertDialogCancel>
          <button
            onClick={handleSave}
            disabled={!nome.trim() || isSaving}
            className="flex-1 sm:flex-none px-5 h-11 bg-accent hover:bg-accent/90 border-none text-white font-bold rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm shadow-md shadow-accent/10 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2Icon size={15} className="animate-spin" />
                Salvataggio...
              </>
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
