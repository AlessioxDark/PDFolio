import React from "react";
import ChevronUpIcon from "../../icons/ChevronUpIcon";
import NoteIcon from "../../icons/NoteIcon";
import TrashIcon from "../../icons/TrashIcon";
import ShareIcon from "../../icons/ShareIcon";
import { useNavigate } from "react-router";
import { AlertDialogComponent } from "@/components/AlertDialogComponent";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import BrainIcon from "@/icons/BrainIcon";

const PdfPageHeader = ({
  nome,
  toggleNotesSidebar,
  toggleAiSidebar,
  edited_at,
  documentId,
}: {
  nome: string;
  edited_at: string;
  toggleNotesSidebar: () => void;
  documentId: string;
}) => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { handleTrashFile } = useDocumentsAndFolders();
  const handlePdfShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast("Il link è stato copiato con successo");
  };
  const getRelativeTimeString = (dateString?: string) => {
    if (!dateString) return "";

    const now = Date.now(); // Millisecondi attuali
    const editedAt = new Date(dateString).getTime(); // Millisecondi della data passata
    const diffInMs = now - editedAt;

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Adesso";
    if (diffInMinutes < 60) return `${diffInMinutes} min fa`;
    if (diffInHours < 24)
      return `${diffInHours} ${diffInHours === 1 ? "ora" : "ore"} fa`;
    return `${diffInDays} ${diffInDays === 1 ? "giorno" : "giorni"} fa`;
  };
  return (
    <div className="w-full px-4 py-3 bg-neutral-1 dark:bg-zinc-950 border-b border-transparent dark:border-zinc-800 flex flex-row items-center justify-between transition-colors duration-300">
      {" "}
      <div className="flex-1 flex flex-row gap-2 items-center font-bold font-inter overflow-hidden">
        <ChevronUpIcon
          className="text-black dark:text-zinc-100 rotate-270 cursor-pointer shrink-0 hover:opacity-80 transition-opacity"
          size={32}
          onClick={() => {
            navigate(-1);
          }}
        />
        <span className="text-lg text-neutral-900 dark:text-zinc-100 truncate">
          {nome}
        </span>{" "}
      </div>
      <div className="flex-1 flex justify-center items-center">
        {" "}
        <span className="text-text-1 dark:text-zinc-400 font-inter whitespace-nowrap text-sm">
          {" "}
          ultimo salvataggio:
          {getRelativeTimeString(edited_at)}
        </span>
      </div>
      <div className="flex-1 flex flex-row gap-3 items-center justify-end">
        <div
          className="cursor-pointer rounded-full bg-neutral-3 dark:bg-zinc-900 hover:bg-neutral-4 dark:hover:bg-zinc-800 p-1.5 border-2 border-neutral-4 dark:border-zinc-800 transition-colors"
          onClick={toggleNotesSidebar}
        >
          <NoteIcon size={23} className="text-black dark:text-zinc-100" />{" "}
        </div>
        <div
          className="cursor-pointer rounded-full bg-neutral-3 dark:bg-zinc-900 hover:bg-neutral-4 dark:hover:bg-zinc-800 p-1.5 border-2 border-neutral-4 dark:border-zinc-800 transition-colors"
          onClick={toggleAiSidebar}
        >
          <BrainIcon size={23} className="text-black dark:text-zinc-100" />{" "}
        </div>
        <AlertDialogComponent
          icon={
            <div className="cursor-pointer rounded-full bg-neutral-3 dark:bg-zinc-900 hover:bg-neutral-4 dark:hover:bg-zinc-800 p-1.5 border-2 border-neutral-4 dark:border-zinc-800 transition-colors">
              {" "}
              <TrashIcon
                size={23}
                className="text-black dark:text-zinc-100 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              />{" "}
            </div>
          }
          title={`Vuoi spostare il documento nel cestino?`}
          desc={`Sei sicuro di spostare il documento nel cestino?`}
          onAction={() => {
            handleTrashFile(documentId);
            setTimeout(() => {
              navigate(-1);
            }, 1000);
          }}
        />

        <div
          className="cursor-pointer rounded-full bg-neutral-3 dark:bg-zinc-900 hover:bg-neutral-4 dark:hover:bg-zinc-800 p-1.5 border-2 border-neutral-4 dark:border-zinc-800 transition-colors"
          onClick={handlePdfShare}
        >
          <ShareIcon size={23} className="text-black dark:text-zinc-100" />{" "}
        </div>
      </div>
    </div>
  );
};

export default PdfPageHeader;
