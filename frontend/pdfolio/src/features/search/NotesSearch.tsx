import HighlightedText from "@/components/HighlightedText";
import { useSearch } from "@/contexts/SearchContext";
import { FileText } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";

const NotesSearch = ({ query }: { query: string }) => {
  const navigate = useNavigate();
  const { globalSearchData } = useSearch();

  return (
    globalSearchData?.notesData &&
    globalSearchData.notesData.length > 0 && (
      <div className="flex flex-col gap-3 mt-2 animate-fadeIn">
        {/* TITOLO SEZIONE */}
        <span className="text-xs font-inter font-bold uppercase text-text-1 dark:text-zinc-400 tracking-wider flex items-center gap-1.5 transition-colors">
          Note e Annotazioni ({globalSearchData.notesData.length})
        </span>

        {/* GRIGLIA CARD NOTE E HIGHLIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {globalSearchData.notesData.map((note: any) => (
            <div
              key={note.note_id}
              onClick={() =>
                navigate(
                  `/pdf/${note.document_id}?page=${note.page}&note=${note.note_id}`,
                )
              }
              className={`group relative flex flex-col gap-4 p-5 bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-2xl hover:shadow-md hover:border-transparent ${
                note.type === "NOTE"
                  ? "hover:ring-2 hover:ring-accent dark:hover:ring-purple-500"
                  : "hover:ring-2 hover:ring-[#FDE047] dark:hover:ring-yellow-500"
              } transition-all duration-300 cursor-pointer`}
            >
              {/* Header Card */}
              <div className="flex items-center justify-between gap-2 border-b border-neutral-200 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-1.5">
                  {note.type === "NOTE" ? (
                    <span className="bg-accent dark:bg-purple-600 text-white text-[10px] font-bold font-inter px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Nota
                    </span>
                  ) : (
                    <span className="bg-[#FDE047] dark:bg-yellow-500/20 text-white dark:text-yellow-400 text-[10px] font-bold font-inter px-2.5 py-0.5 rounded-full uppercase tracking-wider dark:border dark:border-yellow-500/30">
                      Evidenziazione
                    </span>
                  )}
                </div>

                {/* Document Context Badge */}
                <div className="flex items-center gap-1 text-[10px] text-text-1 dark:text-zinc-400 bg-neutral-2 dark:bg-zinc-900 border dark:border-zinc-800 px-2 py-0.5 rounded-full transition-colors max-w-[60%]">
                  <FileText
                    size={10}
                    className="text-neutral-400 dark:text-zinc-500 shrink-0"
                  />
                  <span
                    className="truncate font-medium"
                    title={note.nome_documento}
                  >
                    {note.nome_documento}
                  </span>
                  <span className="text-neutral-300 dark:text-zinc-700 shrink-0">
                    •
                  </span>
                  <span className="font-bold shrink-0 text-neutral-900 dark:text-zinc-300">
                    Pag. {note.page}
                  </span>
                </div>
              </div>

              {/* Contenuto Card */}
              <div className="flex-1 flex flex-col justify-between">
                {note.type === "NOTE" ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-zinc-200 leading-relaxed line-clamp-3">
                      <HighlightedText
                        text={note.content || ""}
                        query={query}
                      />
                    </p>
                    {note.text && (
                      <div className="text-xs text-neutral-600 dark:text-zinc-400 border-l-2 border-neutral-300 dark:border-zinc-700 pl-3 italic bg-neutral-2 dark:bg-zinc-900/50 py-2 px-2.5 font-inter line-clamp-2">
                        "{note.text}"
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-900 dark:text-zinc-300 italic leading-relaxed line-clamp-4 pl-3 border-l-2 border-[#FDE047] dark:border-yellow-500 py-1.5 font-inter">
                    "<HighlightedText text={note.text || ""} query={query} />"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );
};

export default NotesSearch;
