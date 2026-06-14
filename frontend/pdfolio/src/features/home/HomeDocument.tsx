import React from "react";
import PdfThumbnail from "../../components/PdfThumbnail";
import FolderPill from "../../components/FolderPill";
import { useNavigate } from "react-router";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import UnorganizedFolder from "@/components/UnorganizedFolder";

const HomeDocument = ({
  nome,
  file_url,
  folder_id,
  cartelle,

  edited_at,
  document_id,
}) => {
  const navigate = useNavigate();
  const { foldersData, unorganizedFolderData } = useDocumentsAndFolders();
  let folderColor = foldersData.find(
    (f) => f.folder_id === cartelle?.folder_id,
  );
  if (!folderColor) {
    folderColor = unorganizedFolderData;
  }
  console.log("col", folderColor, foldersData, cartelle?.folder_id);
  return (
    <div
      className="w-full h-full flex flex-col justify-between gap-3 p-4 bg-white rounded-xl cursor-pointer transition-all duration-300 shadow-[0_4px_20px_5px_rgba(0,0,0,0.11)] hover:shadow-[0_10px_25px_5px_rgba(0,0,0,0.18)] border border-neutral-100 hover:border-gray-200"
      onClick={() => {
        navigate(`/pdf/${document_id}`);
      }}
    >
      {/* Contenitore thumbnail controllato */}
      <div className="w-full aspect-[3/4] overflow-hidden rounded-lg bg-neutral-50 flex items-center justify-center">
        <PdfThumbnail fileUrl={file_url} />
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
