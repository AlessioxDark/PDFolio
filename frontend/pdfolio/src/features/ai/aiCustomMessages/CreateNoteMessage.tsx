import { Loader } from "lucide-react";
import React, { useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const CreateNoteMessage = ({
  onSaveAsNote,
  selectionDataToUse,
  onReject,
  extractedText,
  m,
  isSavingLocal,
  setIsSavingLocal,
  isRejectingLocal,
  setIsRejectingLocal,
}: any) => {
  const isSaved = !!selectionDataToUse?.isSaved;
  const isRejected = !!selectionDataToUse?.isRejected;
  return (
    <div className="my-3 p-4 border border-purple-200 dark:border-purple-900/60 bg-light-accent dark:bg-purple-950/20 rounded-xl flex flex-col gap-3 shadow-sm text-left font-inter transition-colors">
      {/* Titolo della Nuova Nota */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold text-accent dark:text-purple-400 uppercase tracking-wide">
          Titolo della nota
        </span>
        <div className="text-neutral-800 dark:text-zinc-200 font-bold text-sm bg-white/60 dark:bg-zinc-950/40 border border-emerald-100/50 dark:border-emerald-950/30 rounded-lg px-2.5 py-1.5 shadow-sm">
          {selectionDataToUse?.text}
        </div>
      </div>

      {/* Contenuto Proposto dall'AI */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold text-accent dark:text-purple-400 uppercase tracking-wide">
          Contenuto generato
        </span>
        <div className="text-neutral-800 dark:text-zinc-300 text-xs bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 p-3 rounded-lg shadow-inner leading-relaxed">
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

      {/* Azioni del blocco */}
      <div className="flex gap-2 justify-end mt-1 font-inter">
        {isRejected ? (
          <span className="text-xs text-neutral-400 dark:text-zinc-500 italic py-2">
            Suggerimento scartato
          </span>
        ) : isSaved ? (
          <span className="text-xs text-accent dark:text-purple-400 font-semibold py-2">
            Nota salvata
          </span>
        ) : (
          <>
            <button
              onClick={async () => {
                if (selectionDataToUse && !isRejectingLocal) {
                  setIsRejectingLocal(true);
                  try {
                    await onReject(m.message_id, selectionDataToUse.text);
                  } finally {
                    setIsRejectingLocal(false);
                  }
                }
              }}
              disabled={isSavingLocal || isRejectingLocal || isRejected}
              className="px-3 py-2 text-xs font-medium text-neutral-500 dark:text-zinc-400 hover:text-neutral-700 dark:hover:text-zinc-200 bg-neutral-2 dark:bg-zinc-900 rounded-lg transition-all cursor-pointer"
            >
              {isRejectingLocal ? "Scarto..." : "Scarta"}
            </button>
            <button
              onClick={async () => {
                if (selectionDataToUse && !isSaved && !isSavingLocal) {
                  setIsSavingLocal(true);
                  try {
                    await onSaveAsNote(
                      m.message_id,
                      selectionDataToUse,
                      extractedText,
                    );
                  } finally {
                    setIsSavingLocal(false);
                  }
                }
              }}
              disabled={isSavingLocal || isRejectingLocal || isRejected}
              className="bg-accent hover:bg-accent/80 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-semibold text-xs py-2 px-4 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
            >
              {isSavingLocal ? (
                <>
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                "Aggiungi alle note"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateNoteMessage;
