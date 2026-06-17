import { useSearch } from "@/contexts/SearchContext";
import { SearchX } from "lucide-react";
import React, { useEffect } from "react";
import FolderSearch from "../search/FolderSearch";
import DocumentSearch from "../search/DocumentSearch";
import NotesSearch from "../search/NotesSearch";
import TextSearch from "../search/TextSearch";

const SearchSection = ({
  query,
  isSearching,
}: {
  query: string;
  isSearching: boolean;
}) => {
  const {
    handleGlobalSearch,
    isGlobalQueryLoading,
    globalSearchData,
    setGlobalSearchData,
  } = useSearch();

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

      <FolderSearch />
      <DocumentSearch />
      <NotesSearch query={query} />
      <TextSearch query={query} />

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
