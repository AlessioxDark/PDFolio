import { useNotes } from "@/contexts/NotesContext";
import { Loader2Icon } from "lucide-react";
import React, { useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const ModifyNoteMessage = ({
  props,
  extractedText,
  onUpdateNote,
  onReject,
  m,
  selectionDataToUse,
  isUpdatingLocal,
  setIsUpdatingLocal,
  isRejectingLocal,
  setIsRejectingLocal,
}: any) => {
  const { notesArray } = useNotes();
  const notaOriginale = notesArray.find(
    (note) => note.note_id === props.note_id,
  );

  console.log("sel", selectionDataToUse);
  const isRejected = !!selectionDataToUse?.isRejected;
  const isModified =
    !!selectionDataToUse?.isModified == true ||
    selectionDataToUse?.isModified === "true";
  return (
    <div className="my-3 p-4 border border-purple-200 dark:border-purple-900/60 bg-light-accent dark:bg-purple-950/20 rounded-xl flex flex-col gap-3 shadow-sm text-left font-inter transition-colors">
      {/* Titolo della Nota */}
      <div className="text-neutral-800 dark:text-zinc-200 font-bold text-sm flex items-center gap-1.5">
        <span>{notaOriginale?.text}</span>
      </div>

      {/* Vecchio Contenuto nel DB */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold text-accent dark:text-purple-400 uppercase tracking-wide">
          Testo attuale
        </span>
        <div className="text-neutral-500 dark:text-zinc-400 text-xs bg-neutral-100/70 dark:bg-zinc-950/40 border border-neutral-200 dark:border-zinc-800 rounded-lg p-2.5 line-through italic max-h-24 overflow-y-auto">
          {notaOriginale?.content ||
            notaOriginale?.text ||
            "Nessun contenuto precedente."}
        </div>
      </div>

      {/* Nuova Proposta di Revisione dell'AI */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold text-violet-500 dark:text-violet-400 uppercase tracking-wide">
          Nuova proposta di revisione
        </span>
        <div className="text-neutral-800 dark:text-zinc-300 text-xs bg-white dark:bg-zinc-950 border border-violet-100 dark:border-zinc-800 p-3 rounded-lg shadow-inner leading-relaxed">
          <Markdown
            rehypePlugins={[rehypeRaw]}
            components={{
              p: ({ ...props }) => (
                <p
                  className="my-0 leading-relaxed inline dark:text-zinc-300"
                  {...props}
                />
              ),
              ul: ({ ...props }) => (
                <ul
                  className="list-disc pl-4 my-1 dark:text-zinc-300"
                  {...props}
                />
              ),
              ol: ({ ...props }) => (
                <ol
                  className="list-decimal pl-4 my-1 dark:text-zinc-300"
                  {...props}
                />
              ),
            }}
          >
            {extractedText}
          </Markdown>
        </div>
      </div>

      {/* Pulsanti di Controllo [RIFIUTA / ACCETTA] */}
      <div className="flex gap-2 justify-end mt-1 font-inter">
        {isRejected ? (
          <span className="text-xs text-neutral-400 dark:text-zinc-500 italic py-2">
            Proposta rifiutata
          </span>
        ) : isModified ? (
          <span className="text-xs text-accent dark:text-purple-400 font-semibold py-2">
            Modifica applicata
          </span>
        ) : (
          <>
            <button
              onClick={async () => {
                if (notaOriginale && !isRejectingLocal) {
                  setIsRejectingLocal(true);
                  try {
                    await onReject(m.message_id, notaOriginale.text);
                  } finally {
                    setIsRejectingLocal(false);
                  }
                }
              }}
              disabled={isUpdatingLocal || isRejectingLocal || isRejected}
              className="px-3 py-2 text-xs font-medium text-neutral-500 dark:text-zinc-400 hover:text-neutral-700 dark:hover:text-zinc-200 bg-neutral-2 dark:bg-zinc-900 rounded-lg transition-all cursor-pointer"
            >
              {isRejectingLocal ? "Rifiuto..." : "Rifiuta"}
            </button>
            <button
              onClick={async () => {
                if (notaOriginale && !isUpdatingLocal) {
                  setIsUpdatingLocal(true);
                  try {
                    await onUpdateNote(
                      m.message_id,
                      props.note_id,
                      extractedText,
                    );
                  } finally {
                    setIsUpdatingLocal(false);
                  }
                }
              }}
              disabled={isUpdatingLocal || isRejectingLocal || isRejected}
              className="bg-accent hover:bg-accent/80 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-semibold text-xs py-2 px-4 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
            >
              {isUpdatingLocal ? (
                <>
                  <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                "Applica Modifica"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ModifyNoteMessage;
