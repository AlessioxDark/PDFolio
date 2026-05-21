import React from "react";
import ChevronUpIcon from "../../icons/ChevronUpIcon";
import NoteIcon from "../../icons/NoteIcon";
import TrashIcon from "../../icons/TrashIcon";
import ShareIcon from "../../icons/ShareIcon";
import { useNavigate } from "react-router";

const PdfPageHeader = ({
  nome,
  toggleNotesSidebar,
}: {
  nome: string;
  toggleNotesSidebar: () => void;
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-full px-4 py-3 bg-neutral-1 flex flex-row items-center justify-between">
      <div className="flex-1 flex flex-row gap-2 items-center font-bold font-inter overflow-hidden">
        <ChevronUpIcon
          className="text-black rotate-270 cursor-pointer shrink-0"
          size={32}
          onClick={() => {
            navigate(-1);
          }}
        />
        <span className="text-lg truncate">{nome}</span>
      </div>
      <div className="flex-1 flex justify-center items-center">
        <span className="text-text-1 font-inter whitespace-nowrap text-sm">
          ultimo salvataggio:
          {/* {pdfData?.edited_at} */}
          11m fa
        </span>
      </div>
      <div className="flex-1 flex flex-row gap-3 items-center justify-end">
        <div
          className="cursor-pointer rounded-full bg-neutral-3 p-1.5 border-2 border-neutral-4"
          onClick={toggleNotesSidebar}
        >
          <NoteIcon size={23} className={"text-black"} />
        </div>
        <div className="cursor-pointer rounded-full bg-neutral-3 p-1.5 border-2 border-neutral-4">
          <TrashIcon size={23} className={"text-black"} />
        </div>
        <div className="cursor-pointer rounded-full bg-neutral-3 p-1.5 border-2 border-neutral-4">
          <ShareIcon size={23} className={"text-black"} />
        </div>
      </div>
    </div>
  );
};

export default PdfPageHeader;
