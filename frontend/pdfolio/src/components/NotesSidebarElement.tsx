import React from "react";

const NotesSidebarElement = ({ note }: { note: any }) => {
  return (
    <div
      className={`w-full rounded-xl bg-neutral-1 px-4 py-3 border-l-[5px]   cursor-pointer transition-all group flex flex-col gap-2 ${note.type === "HIGHLIGHT" ? "border-accent" : "border-[rgba(147,51,234,0.4)]"}`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2">
          <div
            className={`aspect-square h-4 rounded-md ${note.type === "HIGHLIGHT" ? "bg-accent" : "bg-[rgba(253, 224, 71, 0.4)]"}`}
          />
          <span className="font-semibold text-[10px] font-inter text-text-1">
            Pagina {note.position.page}
          </span>
        </div>
        <div
          className="px-2 font-medium text-black text-xl truncate whitespace-break-spaces"
          style={{
            backgroundColor: `${
              note.type === "HIGHLIGHT"
                ? "rgba(253, 224, 71, 0.4)"
                : "rgba(147, 51, 234, 0.3)"
            }`,
            // width: `${note.position.width * 1.2}px`,
          }}
        >
          {note.text}
        </div>
      </div>
    </div>
  );
};

export default NotesSidebarElement;
