import Searchbar from "@/components/Searchbar";
import { useSearch } from "@/contexts/SearchContext";
import { FileText, SearchX } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import HomeDocument from "./HomeDocument";
import Folder from "@/components/Folder";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";

const HighlightedText = ({ text, query }: { text: string; query: string }) => {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  const matchIndex = textLower.indexOf(queryLower);

  let displayText = text;
  let prefix = "";
  let suffix = "";

  if (matchIndex !== -1) {
    const start = Math.max(0, matchIndex - 60);
    const end = Math.min(text.length, matchIndex + query.length + 80);
    displayText = text.substring(start, end);
    if (start > 0) prefix = "...";
    if (end < text.length) suffix = "...";
  } else {
    if (text.length > 140) {
      displayText = text.substring(0, 140);
      suffix = "...";
    }
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = displayText.split(regex);

  return (
    <span className="text-neutral-700 leading-relaxed font-medium">
      {prefix}
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-[#FDE047]/40 text-black font-semibold px-1 py-0.5 rounded-[3px] shadow-2xs"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
      {suffix}
    </span>
  );
};

const SearchSection = ({
  query,
  isSearching,
}: {
  query: string;
  isSearching: boolean;
}) => {
  const navigate = useNavigate();
  const {
    handleGlobalSearch,
    isGlobalQueryLoading,
    globalSearchData,
    setGlobalSearchData,
  } = useSearch();

  const { FolderColors } = useDocumentsAndFolders();

  useEffect(() => {
    if (!isSearching) {
      setGlobalSearchData({
        foldersData: [],
        documentsData: [],
        notesData: [],
        textData: [],
      });
      return;
    }

    const delayDebounceId = setTimeout(() => {
      handleGlobalSearch(query.trim());
    }, 400);

    return () => clearTimeout(delayDebounceId);
  }, [query, isSearching]);

  // Calcolo sicuro dei totali (previene crash se i dati sono momentaneamente undefined)
  const totalCount =
    (globalSearchData?.foldersData?.length || 0) +
    (globalSearchData?.documentsData?.length || 0) +
    (globalSearchData?.notesData?.length || 0) +
    (globalSearchData?.textData?.length || 0);

  // ✨ 1. SKELETON LOADING ANIMATO
  if (isGlobalQueryLoading) {
    return (
      <div className="w-full flex flex-col gap-6 bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm min-h-[350px]">
        <div className="flex flex-row justify-between items-center border-b border-neutral-100 pb-3">
          <div className="h-5 w-48 bg-neutral-200 rounded animate-pulse" />
          <div className="h-6 w-24 bg-neutral-100 rounded-full animate-pulse" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
          <div className="grid grid-cols-6 gap-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-neutral-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 mt-4">
          <div className="h-4 w-40 bg-neutral-200 rounded animate-pulse" />
          <div className="h-16 bg-neutral-50 rounded-xl border border-neutral-100 animate-pulse" />
          <div className="h-16 bg-neutral-50 rounded-xl border border-neutral-100 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm min-h-[350px] transition-all duration-300">
      <div className="flex flex-row justify-between items-center border-b border-neutral-100 pb-4">
        <h3 className="text-sm font-inter font-semibold text-neutral-500 tracking-wide flex items-center gap-2">
          Risultati per{" "}
          <span className="text-neutral-900 font-bold italic font-inter">
            "{query}"
          </span>
        </h3>
        <span className="text-xs bg-neutral-2 border border-neutral-4 font-medium px-3 py-1 rounded-full font-inter text-neutral-700 shadow-sm">
          {totalCount}{" "}
          {totalCount === 1 ? "elemento trovato" : "elementi trovati"}
        </span>
      </div>

      {/* SEZIONE 1: CARTELLE TROVATE */}
      {globalSearchData?.foldersData &&
        globalSearchData.foldersData.length > 0 && (
          <div className="flex flex-col gap-3 animate-fadeIn">
            <span className="text-xs font-inter font-bold uppercase text-text-1 tracking-wider flex items-center gap-1.5 ">
              Cartelle ({globalSearchData.foldersData.length})
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {globalSearchData.foldersData.map((folder: any) => (
                <div key={folder.folder_id}>
                  <Folder
                    {...folder}
                    colors={FolderColors[folder?.color_index || 0]}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      {/* SEZIONE 2: DOCUMENTI TROVATI */}
      {globalSearchData?.documentsData &&
        globalSearchData.documentsData.length > 0 && (
          <div className="flex flex-col gap-3 mt-2 animate-fadeIn">
            <span className="text-xs font-inter font-bold uppercase text-text-1 tracking-wider flex items-center gap-1.5">
              Documenti ({globalSearchData.documentsData.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full items-stretch">
              {globalSearchData.documentsData.map((doc: any, index: number) => (
                <div key={index}>
                  <HomeDocument {...doc} />
                </div>
              ))}
            </div>
          </div>
        )}

      {/* ================= SEZIONE 3: NOTE E PENSIERI ================= */}
      {globalSearchData?.notesData && globalSearchData.notesData.length > 0 && (
        <div className="flex flex-col gap-3 mt-2 animate-fadeIn">
          <span className="text-xs font-inter font-bold uppercase text-text-1 tracking-wider flex items-center gap-1.5">
            Note e Annotazioni ({globalSearchData.notesData.length})
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {globalSearchData.notesData.map((note: any) => (
              <div
                key={note.note_id}
                onClick={() =>
                  navigate(`/pdf/${note.document_id}?page=${note.page}`)
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
      )}

      {globalSearchData?.textData && globalSearchData.textData.length > 0 && (
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
      )}
      {/* ✨ 2. FALLBACK DESIGN DI LIVELLO SUPERIORE (NESSUN RISULTATO) */}
      {totalCount === 0 && (
        <div className="flex flex-col items-center justify-center py-14 text-center animate-fadeIn">
          <div className="p-4 bg-neutral-50 rounded-full border border-neutral-100 mb-4 text-neutral-400 shadow-inner">
            <SearchX size={32} className="stroke-[1.5]" />
          </div>
          <h4 className="text-base font-semibold text-neutral-800">
            Nessun risultato trovato
          </h4>
          <p className="text-sm text-neutral-400 max-w-sm mt-1 leading-relaxed">
            Non abbiamo trovato corrispondenze per{" "}
            <span className="font-semibold text-neutral-600">"{query}"</span>.
            Controlla l'ortografia o prova a cercare parole chiave diverse.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchSection;
