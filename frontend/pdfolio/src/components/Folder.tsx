import React from "react";
import FolderIcon from "../icons/FolderIcon";

const Folder = ({
  nome,
  length,
  bgColor,
  iconColor,
}: {
  nome: string;
  length: number;
  bgColor: string;
  iconColor: string;
}) => {
  return (
    <div
      className={`flex flex-col w-32 h-30 items-center justify-end rounded-2xl pb-3 relative cursor-pointer ${bgColor} transition-colors duration-300 group bg-purple`}
    >
      {/* "flex flex-col w-32 h-28 items-center justify-end  bg-[#60A5FA] rounded-2xl pb-3 relative cursor-pointer hover:bg-[#60A5FA]/85 transition-colors duration-300 group" */}
      <div className="w-[70px] flex flex-col items-center">
        <FolderIcon
          className={` transition-colors duration-300 ${iconColor}`}
          // text-[#1D4ED8] group-hover:text-[#1D4ED8]/85 transition-colors duration-300
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
