import React from "react";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import { FolderIcon } from "lucide-react";
import OpenBoxIcon from "@/icons/OpenBoxIcon";

const UnorganizedFolder = () => {
  const { unorganizedFolderData, setActiveFolder } = useDocumentsAndFolders();
  return (
    <div
      className={`flex flex-col w-32 h-30 items-center justify-end rounded-2xl pb-3 relative cursor-pointer  ${unorganizedFolderData.colors.bg} transition-colors duration-300 group bg-purple`}
      onClick={() => setActiveFolder(unorganizedFolderData)}
    >
      <div className="w-[70px] flex flex-col items-center">
        <OpenBoxIcon
          className={` transition-colors duration-300 ${unorganizedFolderData.colors.text}`}
          size={70}
        />
        <span className="font-inter text-white text-sm text-center w-full font-medium line-clamp-1">
          {unorganizedFolderData.nome}
        </span>
      </div>
      <span className="font-inter text-white text-base absolute top-1.5 right-3 font-bold ">
        {unorganizedFolderData.documenti.length}
      </span>
    </div>
  );
};

export default UnorganizedFolder;
