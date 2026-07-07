import { useSearch } from "@/contexts/SearchContext";
import { SearchX } from "lucide-react";
import React, { useEffect } from "react";
import FolderSearch from "../search/FolderSearch";
import DocumentSearch from "../search/DocumentSearch";
import NotesSearch from "../search/NotesSearch";
import TextSearch from "../search/TextSearch";
import { useApi } from "@/contexts/ApiContext";

const SearchSection = ({
  query,
  isSearching,
}: {
  query: string;
  isSearching: boolean;
}) => {
  const {
    handleGlobalSearch,

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
  const { loading } = useApi();
  // Calcolo sicuro dei totali (previene crash se i dati sono momentaneamente undefined)
  const totalCount =
    (globalSearchData?.foldersData?.length || 0) +
    (globalSearchData?.documentsData?.length || 0) +
    (globalSearchData?.notesData?.length || 0) +
    (globalSearchData?.textData?.length || 0);

  // ✨ 1. SKELETON LOADING ANIMATO
  if (loading?.global_search) {
    return (
      <div className="w-full flex flex-col gap-6 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm min-h-[350px] transition-colors duration-300">
        {/* 1. HEADER SKELETON */}
        <div className="flex flex-row justify-between items-center border-b border-neutral-100 dark:border-zinc-800 pb-3">
          <div className="h-5 w-48 bg-neutral-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-6 w-24 bg-neutral-100 dark:bg-zinc-800/60 rounded-full animate-pulse" />
        </div>

        {/* 2. GRID SKELETON (Es. Cartelle o Documenti recenti) */}
        <div className="flex flex-col gap-4">
          <div className="h-4 w-32 bg-neutral-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="grid grid-cols-6 gap-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-neutral-100 dark:bg-zinc-950 rounded-xl border dark:border-zinc-800/40 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* 3. LIST SKELETON (Es. Corrispondenze di testo o Note) */}
        <div className="flex flex-col gap-3 mt-4">
          <div className="h-4 w-40 bg-neutral-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-16 bg-neutral-50 dark:bg-zinc-950 rounded-xl border border-neutral-100 dark:border-zinc-800 animate-pulse" />
          <div className="h-16 bg-neutral-50 dark:bg-zinc-950 rounded-xl border border-neutral-100 dark:border-zinc-800 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm min-h-[350px] transition-all duration-300">
      {/* HEADER DEI RISULTATI */}
      <div className="flex flex-row justify-between items-center border-b border-neutral-100 dark:border-zinc-800 pb-4">
        <h3 className="text-sm font-inter font-semibold text-neutral-500 dark:text-zinc-400 tracking-wide flex items-center gap-2">
          Risultati per{" "}
          <span className="text-neutral-900 dark:text-zinc-100 font-bold italic font-inter">
            "{query}"
          </span>
        </h3>
        <span className="text-xs bg-neutral-2 dark:bg-zinc-950 border border-neutral-4 dark:border-zinc-800 font-medium px-3 py-1 rounded-full font-inter text-neutral-700 dark:text-zinc-300 shadow-sm transition-colors">
          {totalCount}{" "}
          {totalCount === 1 ? "elemento trovato" : "elementi trovati"}
        </span>
      </div>

      {/* COMPONENTI DI RICERCA INTERNI */}
      <FolderSearch />
      <DocumentSearch />
      <NotesSearch query={query} />
      <TextSearch query={query} />

      {/* EMPTY STATE (Nessun Risultato) */}
      {totalCount === 0 && (
        <div className="flex flex-col items-center justify-center py-14 text-center animate-fadeIn">
          <div className="p-4 bg-neutral-50 dark:bg-zinc-950 rounded-full border border-neutral-100 dark:border-zinc-800 mb-4 text-neutral-400 dark:text-zinc-500 shadow-inner transition-colors">
            <SearchX size={32} className="stroke-[1.5]" />
          </div>
          <h4 className="text-base font-semibold text-neutral-800 dark:text-zinc-200">
            Nessun risultato trovato
          </h4>
          <p className="text-sm text-neutral-400 dark:text-zinc-500 max-w-sm mt-1 leading-relaxed">
            Non abbiamo trovato corrispondenze per{" "}
            <span className="font-semibold text-neutral-600 dark:text-zinc-400">
              "{query}"
            </span>
            . Controlla l'ortografia o prova a cercare parole chiave diverse.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchSection;
