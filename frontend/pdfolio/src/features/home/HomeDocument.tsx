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
      className="w-full h-full flex flex-col relative  gap-3 p-4 pr-1.5 bg-white rounded-xl cursor-pointer transition-all duration-300 shadow-[0_4px_20px_5px_rgba(0,0,0,0.11)] hover:shadow-[0_10px_25px_5px_rgba(0,0,0,0.18)] border border-neutral-100 hover:border-gray-200 max-h-[380px]"
      onClick={() => {
        if (!showMenu && !isEditOpen) {
          navigate(`/pdf/${document_id}`);
        }
      }}
    >
      {showMenu && (
        <div
          className="absolute top-10 right-0 z-20 w-48 bg-white rounded-xl flex flex-col"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <button
            className="text-black p-2 hover:bg-neutral-100 border-b border-neutral-100 text-left w-full"
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
                className="w-full text-black p-2 hover:bg-neutral-100 border-b border-neutral-100 text-left"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                Elimina
              </button>
            }
            title={`Vuoi eliminare il documento dalla piattaforma?`}
            desc={`Sei sicuro di voler rimuovere il documento dalla piattaforma?`}
            onAction={(e) => {
              e.stopPropagation();
              handlePdfDelete(document_id);
            }}
          />
          <button
            className="text-black p-2 hover:bg-neutral-100 text-left w-full"
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
        <div className="w-full aspect-[3/4] overflow-hidden rounded-lg bg-neutral-50 flex items-center justify-center">
          <PdfThumbnail fileUrl={file_url} />
        </div>
        <KebabIcon
          size={20}
          className="text-black"
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
          className="font-inter text-neutral-900 font-bold text-base truncate"
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
                  className="font-inter text-[10px] font-semibold bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded-md border border-neutral-200/60 max-w-[90px] truncate"
                  title={tag}
                >
                  #{tag}
                </span>
              ))}
              {/* Se ci sono più di 2 tag, mostra un indicatore numerico discreto */}
              {tags.length > 2 && (
                <span className="font-inter text-[10px] font-bold text-neutral-400 pl-0.5">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        <span className="font-inter text-neutral-400 text-xs mt-1 block mt-auto">
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
