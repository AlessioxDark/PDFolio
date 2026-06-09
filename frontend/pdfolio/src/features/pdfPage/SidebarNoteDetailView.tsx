import NotesSidebarElement from "@/components/NotesSidebarElement";
import { MoveLeft } from "lucide-react";
import React from "react";

const SidebarNoteDetailView = ({ note, onBack, scrollToNoteInPdf }) => {
  return (
    <div className="w-[500px] py-2 h-full flex flex-col">
      {/* Header del dettaglio */}
      <div className="flex w-full flex-row items-center gap-3 mb-4 border-b border-b-neutral-4 px-4 py-4 shrink-0">
        <MoveLeft
          size={24}
          className="text-text-1 cursor-pointer hover:text-black transition-colors"
          onClick={onBack}
        />
        <h1 className="text-xl font-bold font-inter text-black">
          Dettaglio Nota
        </h1>
      </div>

      {/* Contenuto del dettaglio */}
      <div className="px-4 flex flex-col gap-3 flex-1 overflow-y-auto">
        <NotesSidebarElement
          note={note}
          scrollToNoteInPdf={scrollToNoteInPdf}
          // Non passiamo la freccia qui dentro, siamo già nel dettaglio
        />

        {/* Qui in futuro potrai mettere i commenti dell'AI, thread di risposte, ecc. */}
        <div className="text-xs text-neutral-400 p-2 italic">
          Spazio per feature future (es: Chat dedicata a questa nota...)
        </div>
      </div>
    </div>
  );
};

export default SidebarNoteDetailView;
