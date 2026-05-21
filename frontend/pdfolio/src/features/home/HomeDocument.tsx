import React from "react";
import PdfThumbnail from "../../components/PdfThumbnail";
import FolderPill from "../../components/FolderPill";
import { useNavigate } from "react-router";

const HomeDocument = ({
  nome,
  file_url,
  folder_id,
  cartelle,
  colorIndex,
  edited_at,
  document_id,
}) => {
  const navigate = useNavigate();
  return (
    <div
      className="w-fit flex flex-col gap-1 py-4 px-4 bg-white rounded-xl cursor-pointer transition-all duration-300 shadow-[0_4px_20px_5px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_20px_5px_rgba(0,0,0,0.25)] border border-transparent hover:border-gray-100"
      onClick={() => {
        navigate(`/pdf/${document_id}`);
      }}
    >
      <PdfThumbnail fileUrl={file_url} />
      <span className=" font-inter text-black font-bold text-2xl">{nome}</span>
      <FolderPill
        folder_id={folder_id}
        nome={cartelle?.nome}
        colorIndex={colorIndex}
      />
      <span className="font-inter text-text-1 text-sm">
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
  );
};

export default HomeDocument;
