import React from "react";
import ChevronUpIcon from "../../icons/ChevronUpIcon";
import NoteIcon from "../../icons/NoteIcon";
import TrashIcon from "../../icons/TrashIcon";
import ShareIcon from "../../icons/ShareIcon";
import { useNavigate } from "react-router";
import { AlertDialogComponent } from "@/components/AlertDialogComponent";
import { toast } from "sonner";
import { LucideAArrowDown, LucideCable } from "lucide-react";
import { apiCalls } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";

const PdfPageHeader = ({
  nome,
  toggleNotesSidebar,
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
  const { setDocumentsData, setFoldersData, setUnorganizedFolderData } =
    useDocumentsAndFolders();
  const handlePdfDelete = async () => {
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
      toast("Il file è stat WWo eliminato");

      setTimeout(() => {
        navigate(-1);
      }, 100);
    }
  };
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
    <div className="w-full px-4 py-3 bg-neutral-1 flex flex-row items-center justify-between">
      <div className="flex-1 flex flex-row gap-2 items-center font-bold font-inter overflow-hidden">
        <ChevronUpIcon
          className="text-black rotate-270 cursor-pointer shrink-0"
          size={32}
          onClick={() => {
            navigate(-1);
          }}
        />
        <span className="text-lg truncate">{nome}</span>
      </div>
      <div className="flex-1 flex justify-center items-center">
        <span className="text-text-1 font-inter whitespace-nowrap text-sm">
          ultimo salvataggio:
          {getRelativeTimeString(edited_at)}
        </span>
      </div>
      <div className="flex-1 flex flex-row gap-3 items-center justify-end">
        <div
          className="cursor-pointer rounded-full bg-neutral-3 p-1.5 border-2 border-neutral-4"
          onClick={toggleNotesSidebar}
        >
          <NoteIcon size={23} className={"text-black"} />
        </div>
        <AlertDialogComponent
          icon={
            <div className="cursor-pointer rounded-full bg-neutral-3 p-1.5 border-2 border-neutral-4">
              <TrashIcon size={23} className={"text-black"} />
            </div>
          }
          title={`Vuoi eliminare il documento dalla piattaforma?`}
          desc={`Sei sicuro di voler rimuovere il documento dalla piattaforma?`}
          onAction={handlePdfDelete}
        />

        <div
          className="cursor-pointer rounded-full bg-neutral-3 p-1.5 border-2 border-neutral-4"
          onClick={handlePdfShare}
        >
          <ShareIcon size={23} className={"text-black"} />
        </div>
      </div>
    </div>
  );
};

export default PdfPageHeader;
