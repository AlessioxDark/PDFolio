import React from "react";
import FolderIcon from "../icons/FolderIcon";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";

const Folder = ({
  nome,
  length,
  colors,
  folder,
}: {
  nome: string;
  length: number;
  colors: { bg: string; text: string };
  folder: Object;
}) => {
  const { setActiveFolder } = useDocumentsAndFolders();
  return (
    <div
      className={`flex flex-col w-32 h-30 items-center justify-end rounded-2xl pb-3 relative cursor-pointer ${colors.bg} transition-colors duration-300 group bg-purple`}
      onClick={() => setActiveFolder(folder)}
    >
      <div className="w-[70px] flex flex-col items-center">
        <FolderIcon
          className={` transition-colors duration-300 ${colors.text}`}
          size={70}
        />
        <span className="font-inter text-white text-sm text-center w-full font-medium line-clamp-1">
          {nome}
        </span>
      </div>
      <span className="font-inter text-white text-base absolute top-1.5 right-3 font-bold ">
        {length}
      </span>
    </div>
  );
};

export default Folder;
