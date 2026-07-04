import React, { useState } from "react";
import PdfThumbnail from "../../components/PdfThumbnail";
import FolderPill from "../../components/FolderPill";
import { useNavigate } from "react-router";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import UnorganizedFolder from "@/components/UnorganizedFolder";
import KebabIcon from "@/icons/KebabIcon";
import { AlertDialogComponent } from "@/components/AlertDialogComponent";
import EditDocumentDialog from "./EditDocumentDialog";

const HomeDocument = ({
  nome,
  file_url,
  folder_id,
  cartelle,
  tags,
  edited_at,
  document_id,
}) => {
  const navigate = useNavigate();
  const { foldersData, unorganizedFolderData, handlePdfDelete } =
    useDocumentsAndFolders();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editMode, setEditMode] = useState<"edit" | "move">("edit");
  let folderColor = foldersData.find((f) => f.folder_id === folder_id);
  if (!folderColor) {
    folderColor = unorganizedFolderData;
  }
  return (
    <div
      className="w-full h-full bg-white dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800/60 border border-neutral-100 hover:border-gray-200 dark:border-zinc-800 dark:hover:border-zinc-800/40 flex flex-col relative gap-3 p-4 pr-1.5 rounded-xl cursor-pointer transition-all duration-300 shadow-[0_4px_20px_5px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_25px_5px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_25px_5px_rgba(0,0,0,0.12)] max-h-[380px]"
      onClick={() => {
        if (!showMenu && !isEditOpen) {
          navigate(`/pdf/${document_id}`);
        }
      }}
    >
      {showMenu && (
        <div
          className="absolute top-10 right-2 z-20 w-48 bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 rounded-xl shadow-xl flex flex-col p-1 gap-0.5"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <button
            className="text-black dark:text-zinc-200 p-2 hover:bg-neutral-100 dark:hover:bg-zinc-700/60 rounded-lg text-left w-full text-xs font-medium transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setEditMode("edit");
              setIsEditOpen(true);
              setShowMenu(false);
            }}
          >
            Modifica
          </button>
          <AlertDialogComponent
            icon={
              <button
                className="text-black dark:text-zinc-200 p-2 hover:bg-neutral-100 dark:hover:bg-zinc-700/60 rounded-lg text-left w-full text-xs font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                Elimina
              </button>
            }
            title={`Vuoi spostare il documento nel cestino?`}
            desc={`Sei sicuro di spostare il documento nel cestino?`}
            onAction={(e) => {
              e.stopPropagation();
              handlePdfDelete(document_id);
            }}
          />
          <button
            className="text-black dark:text-zinc-200 p-2 hover:bg-neutral-100 dark:hover:bg-zinc-700/60 rounded-lg text-left w-full text-xs font-medium transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setEditMode("move");
              setIsEditOpen(true);
              setShowMenu(false);
            }}
          >
            Sposta
          </button>
        </div>
      )}
      <EditDocumentDialog
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        documentId={document_id}
        currentNome={nome}
        currentFolderId={folder_id}
        defaultMode={editMode}
        tags={tags}
      />
      {/* Contenitore thumbnail controllato */}
      <div className="w-full flex flex-row gap-1">
        <div className="w-full aspect-[3/4] overflow-hidden rounded-lg bg-neutral-50 dark:bg-zinc-950 flex items-center justify-center border border-transparent dark:border-zinc-800">
          {" "}
          <PdfThumbnail fileUrl={file_url} />
        </div>
        <KebabIcon
          size={20}
          className="text-neutral-500 dark:text-zinc-400 hover:text-neutral-800 dark:hover:text-zinc-200 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu((prev) => !prev);
          }}
        />
      </div>

      {/* Info File */}
      <div className="flex flex-col gap-1 w-full h-full">
        {/* ⚡ Cambiato text-2xl a text-base e aggiunto truncate per titoli lunghi */}
        <span
          className="font-inter text-neutral-900 dark:text-zinc-100 font-bold text-base truncate"
          title={nome}
        >
          {nome}
        </span>

        <div className="w-fit max-w-full flex flex-col gap-2">
          <FolderPill
            folder_id={folder_id}
            nome={folderColor?.nome}
            colors={folderColor?.colors}
          />
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 max-w-full items-center">
              {tags.slice(0, 2).map((tag, idx) => (
                <span
                  key={idx}
                  className="font-inter text-[10px] font-semibold bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300 px-1.5 py-0.5 rounded-md border border-neutral-200/60 dark:border-zinc-700/50 max-w-[90px] truncate"
                  title={tag}
                >
                  #{tag}
                </span>
              ))}
              {/* Se ci sono più di 2 tag, mostra un indicatore numerico discreto */}
              {tags.length > 2 && (
                <span className="font-inter text-[10px] font-bold text-neutral-400 dark:text-zinc-500 pl-0.5">
                  {" "}
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        <span className="font-inter text-neutral-400 dark:text-zinc-500 text-xs mt-auto block pt-1">
          {" "}
          {new Date(edited_at).toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {", "}
          {new Date(edited_at).toLocaleDateString("it-IT", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};

export default HomeDocument;
