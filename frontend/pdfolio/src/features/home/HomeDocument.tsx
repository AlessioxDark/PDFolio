import React, { useState } from "react";
import PdfThumbnail from "../../components/PdfThumbnail";
import FolderPill from "../../components/FolderPill";
import { useNavigate } from "react-router";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import UnorganizedFolder from "@/components/UnorganizedFolder";
import KebabIcon from "@/icons/KebabIcon";
import { AlertDialogComponent } from "@/components/AlertDialogComponent";

const HomeDocument = ({
  nome,
  file_url,
  folder_id,
  cartelle,

  edited_at,
  document_id,
}) => {
  const navigate = useNavigate();
  const { foldersData, unorganizedFolderData, handlePdfDelete } =
    useDocumentsAndFolders();
  const [showMenu, setShowMenu] = useState(false);
  let folderColor = foldersData.find((f) => f.folder_id === folder_id);
  if (!folderColor) {
    folderColor = unorganizedFolderData;
  }
  console.log("col", folderColor, foldersData, cartelle?.folder_id);
  return (
    <div
      className="w-full h-full flex flex-col relative justify-between gap-3 p-4 pr-1.5 bg-white rounded-xl cursor-pointer transition-all duration-300 shadow-[0_4px_20px_5px_rgba(0,0,0,0.11)] hover:shadow-[0_10px_25px_5px_rgba(0,0,0,0.18)] border border-neutral-100 hover:border-gray-200"
      onClick={() => {
        navigate(`/pdf/${document_id}`);
      }}
    >
      {showMenu && (
        <div className="absolute top-10 right-0 z-20 w-48 bg-white rounded-xl flex flex-col">
          <button
            className="text-black p-2 hover:bg-neutral-100 border-b border-neutral-100"
            onClick={() => setShowMenu(false)}
          >
            Rinomina
          </button>
          <AlertDialogComponent
            icon={
              <button
                className="w-full text-black p-2 hover:bg-neutral-100 border-b border-neutral-100"
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
            className="text-black p-2 hover:bg-neutral-100"
            onClick={() => setShowMenu(false)}
          >
            Sposta
          </button>
        </div>
      )}
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
            console.log("kebab cliccato");
            setShowMenu(true);
          }}
        />
      </div>

      {/* Info File */}
      <div className="flex flex-col gap-1 w-full mt-1">
        {/* ⚡ Cambiato text-2xl a text-base e aggiunto truncate per titoli lunghi */}
        <span
          className="font-inter text-neutral-900 font-bold text-base truncate"
          title={nome}
        >
          {nome}
        </span>

        <div className="w-fit max-w-full">
          <FolderPill
            folder_id={folder_id}
            nome={folderColor?.nome}
            colors={folderColor?.colors}
          />
        </div>

        <span className="font-inter text-neutral-400 text-xs mt-1 block">
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
