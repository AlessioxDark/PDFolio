import React from "react";
import FolderIcon from "../icons/FolderIcon";

const FolderPill = ({ folder_id, nome, colors }) => {
  return (
    <div
      className={`px-2 py-1.5 ${colors?.bg} flex flex-row gap-1.5 items-center rounded-2xl cursor-pointer w-fit`}
    >
      <FolderIcon
        className={` transition-colors duration-300 ${colors?.text}`}
        size={20}
      />
      <span className="text-white text-sm font-inter font-medium">{nome}</span>
    </div>
  );
};

export default FolderPill;
