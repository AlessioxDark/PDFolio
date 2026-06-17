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
        <span className="text-xs font-inter font-bold uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
          Corrispondenze nel testo dei documenti (
          {globalSearchData.textData.length})
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {globalSearchData.textData.map((h: any, idx: number) => {
            const pageNum = h.page_number;
            return (
              <div
                key={h.page_id || idx}
                onClick={() =>
                  navigate(`/pdf/${h.document_id}?page=${pageNum}`)
                }
                className="group relative flex flex-col gap-3.5 p-5 bg-white border border-neutral-200 rounded-2xl hover:shadow-md hover:border-transparent hover:ring-2 hover:ring-accent transition-all duration-300 cursor-pointer"
              >
                {/* Header Card pulito ed elegante */}
                <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-text-1 group-hover:text-accent transition-colors max-w-[75%]">
                    <FileText
                      size={14}
                      className="text-neutral-400 shrink-0 group-hover:text-accent transition-colors"
                    />
                    <span className="truncate" title={h.nome_documento}>
                      {h.nome_documento}
                    </span>
                  </div>

                  <span className="text-[10px] bg-neutral-3 text-neutral-600 font-bold px-2 py-0.5 rounded-md shrink-0">
                    Pag. {pageNum}
                  </span>
                </div>

                {/* Frammento di testo estratto */}
                <div className="flex-1">
                  <p className="text-sm text-neutral-600 leading-relaxed italic group-hover:text-neutral-800 transition-colors">
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
