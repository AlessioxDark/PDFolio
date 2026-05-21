import React from "react";
import FolderIcon from "../icons/FolderIcon";

const FolderPill = ({ folder_id, nome, colorIndex }) => {
  const FolderColors = [
    {
      bg: "bg-blue-400 ",
      text: "text-blue-700 ",
    },
    {
      bg: "bg-fuchsia-400 ",
      text: "text-fuchsia-700 ",
    },
    {
      bg: "bg-rose-400 ",
      text: "text-rose-700 ",
    },
    {
      bg: "bg-sky-400 ",
      text: "text-sky-700 ",
    },
    {
      bg: "bg-green-400 ",
      text: "text-green-700 ",
    },
    {
      bg: "bg-amber-400 ",
      text: "text-amber-700 ",
    },
  ];
  const actualIndex = colorIndex !== undefined ? colorIndex : 0;
  const myColor = FolderColors[actualIndex] || { text: "", bg: "" };

  return (
    <div
      className={`px-2 py-1.5 ${myColor.bg} flex flex-row gap-1.5 items-center rounded-2xl cursor-pointer w-fit`}
    >
      <FolderIcon
        className={` transition-colors duration-300 ${myColor.text}`}
        size={20}
      />
      <span className="text-white text-sm font-inter font-medium">{nome}</span>
    </div>
  );
};

export default FolderPill;
