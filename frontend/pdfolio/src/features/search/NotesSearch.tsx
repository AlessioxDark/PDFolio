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
        <span className="text-xs font-inter font-bold uppercase text-text-1 tracking-wider flex items-center gap-1.5">
          Note e Annotazioni ({globalSearchData.notesData.length})
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {globalSearchData.notesData.map((note: any) => (
            <div
              key={note.note_id}
              onClick={() =>
                navigate(
                  `/pdf/${note.document_id}?page=${note.page}&note=${note.note_id}`,
                )
              }
              className={`group relative flex flex-col gap-4 p-5 bg-white border border-neutral-200 rounded-2xl hover:shadow-md hover:border-transparent ${
                note.type === "NOTE"
                  ? "hover:ring-2 hover:ring-accent"
                  : "hover:ring-2 hover:ring-[#FDE047]"
              } transition-all duration-300 cursor-pointer`}
            >
              {/* Header Card */}
              <div className="flex items-center justify-between gap-2 border-b border-neutral-200 pb-2.5">
                <div className="flex items-center gap-1.5">
                  {note.type === "NOTE" ? (
                    <span className="bg-accent text-white text-[10px] font-bold font-inter px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Nota
                    </span>
                  ) : (
                    <span className="bg-[#FDE047] text-white text-[10px] font-bold font-inter px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Evidenziazione
                    </span>
                  )}
                </div>

                {/* Document Context Badge */}
                <div className="flex items-center gap-1 text-[10px] text-text-1 bg-neutral-2 px-2 py-0.5 rounded-full transition-colors max-w-[60%]">
                  <FileText size={10} className="text-neutral-400 shrink-0" />
                  <span
                    className="truncate font-medium"
                    title={note.nome_documento}
                  >
                    {note.nome_documento}
                  </span>
                  <span className="text-neutral-300 shrink-0">•</span>
                  <span className="font-bold shrink-0">Pag. {note.page}</span>
                </div>
              </div>

              {/* Contenuto Card */}
              <div className="flex-1 flex flex-col justify-between">
                {note.type === "NOTE" ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-semibold text-neutral-900 leading-relaxed line-clamp-3">
                      <HighlightedText
                        text={note.content || ""}
                        query={query}
                      />
                    </p>
                    {note.text && (
                      <div className="text-xs text-neutral-600 border-l-2 border-neutral-300 pl-3 italic bg-neutral-2 py-2 px-2.5 font-inter line-clamp-2">
                        "{note.text}"
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-900 italic leading-relaxed line-clamp-4 pl-3 border-l-2 border-[#FDE047] py-1.5 font-inter">
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
