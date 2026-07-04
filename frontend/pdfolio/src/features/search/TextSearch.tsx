import HighlightedText from "@/components/HighlightedText";
import { useSearch } from "@/contexts/SearchContext";
import { FileText } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";

const TextSearch = ({ query }: { query: string }) => {
  const navigate = useNavigate();
  const { globalSearchData } = useSearch();

  return (
    globalSearchData?.textData &&
    globalSearchData.textData.length > 0 && (
      <div className="flex flex-col gap-3 mt-6 animate-fadeIn">
        {/* TITOLO SEZIONE */}
        <span className="text-xs font-inter font-bold uppercase text-neutral-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5 transition-colors">
          Corrispondenze nel testo dei documenti (
          {globalSearchData.textData.length})
        </span>

        {/* GRIGLIA RISULTATI DI TESTO ESTRATTO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {globalSearchData.textData.map((h: any, idx: number) => {
            const pageNum = h.page_number;
            return (
              <div
                key={h.page_id || idx}
                onClick={() =>
                  navigate(`/pdf/${h.document_id}?page=${pageNum}`)
                }
                className="group relative flex flex-col gap-3.5 p-5 bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-2xl hover:shadow-md hover:border-transparent hover:ring-2 hover:ring-accent dark:hover:ring-purple-500 transition-all duration-300 cursor-pointer"
              >
                {/* Header Card */}
                <div className="flex items-center justify-between gap-4 border-b border-neutral-200 dark:border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-text-1 dark:text-zinc-300 group-hover:text-accent dark:group-hover:text-purple-400 transition-colors max-w-[75%]">
                    <FileText
                      size={14}
                      className="text-neutral-400 dark:text-zinc-500 shrink-0 group-hover:text-accent dark:group-hover:text-purple-400 transition-colors"
                    />
                    <span className="truncate" title={h.nome_documento}>
                      {h.nome_documento}
                    </span>
                  </div>

                  {/* Badge Pagina */}
                  <span className="text-[10px] bg-neutral-3 dark:bg-zinc-900 text-neutral-600 dark:text-zinc-400 font-bold px-2 py-0.5 rounded-md shrink-0 border dark:border-zinc-800 transition-colors">
                    Pag. {pageNum}
                  </span>
                </div>

                {/* Frammento di testo estratto (Snippet) */}
                <div className="flex-1">
                  <p className="text-sm text-neutral-600 dark:text-zinc-400 leading-relaxed italic group-hover:text-neutral-800 dark:group-hover:text-zinc-200 transition-colors">
                    "...
                    <HighlightedText
                      text={h.text || h.testo_estratto || ""}
                      query={query}
                    />
                    ..."
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )
  );
};

export default TextSearch;
