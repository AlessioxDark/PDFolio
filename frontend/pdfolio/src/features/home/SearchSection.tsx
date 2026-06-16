import Searchbar from "@/components/Searchbar";
import { useSearch } from "@/contexts/SearchContext";
import { Bookmark, FileText, Hash } from "lucide-react";
import React, { useEffect } from "react";
import HomeDocument from "./HomeDocument";

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
      setGlobalSearchData(null);
      return;
    }

    // Aspetta 400ms dopo che l'utente ha smesso di digitare prima di sparare la richiesta
    const delayDebounceId = setTimeout(() => {
      handleGlobalSearch(query.trim());
    }, 400);

    return () => clearTimeout(delayDebounceId);
  }, [query]);
  return isGlobalQueryLoading ? (
    <div>caricamento query</div>
  ) : (
    <div className="w-7/10 flex flex-col gap-6 bg-white border border-neutral-3 rounded-2xl p-6 shadow-sm min-h-[300px]">
      <div className="flex flex-row justify-between items-center border-b border-neutral-3 pb-3">
        <h3 className="text-sm font-semibold text-neutral-4 font-inter">
          Risultati per <span className="text-black italic">"{query}"</span>
        </h3>
        <span className="text-xs bg-neutral-2 px-2 py-1 rounded-md text-text-1">
          {/* {globalSearchData?.totalCount || 0} elementi trovati */}
        </span>
      </div>

      {/* SEZIONE 1: CARTELLE TROVATE */}
      {globalSearchData?.foldersData &&
        globalSearchData.foldersData.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase text-neutral-4 tracking-wider flex items-center gap-1">
              {/* <FolderIcon size={14} /> Cartelle */}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {globalSearchData.foldersData.map((f: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-neutral-2 hover:bg-neutral-3 p-3 rounded-xl cursor-pointer transition-all"
                >
                  {/* <div
                  className={`w-3 h-3 rounded-full ${FolderColors[idx % FolderColors.length].bg}`}
                /> */}
                  <span className="text-sm font-medium text-black">
                    {f.nome}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* SEZIONE 2: DOCUMENTI TROVATI */}
      {globalSearchData?.documentsData &&
        globalSearchData.documentsData.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            <span className="text-xs font-bold uppercase text-neutral-4 tracking-wider flex items-center gap-1">
              <FileText size={14} /> Documenti (PDF)
            </span>
            <div className="flex flex-col gap-2">
              {globalSearchData.documentsData.map((doc: any, index: number) => {
                return <HomeDocument key={index} {...doc} />;
              })}
            </div>
          </div>
        )}

      {/* SEZIONE 3: NOTE E PENSIERI DELL'UTENTE */}
      {globalSearchData?.notesData && globalSearchData.notesData.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          <span className="text-xs font-bold uppercase text-neutral-4 tracking-wider flex items-center gap-1">
            <Bookmark size={14} /> I tuoi commenti e note
          </span>
          <div className="flex flex-col gap-2">
            {globalSearchData.notesData.map((note: any) => (
              <div
                key={note.id}
                className="border-l-4 border-accent bg-neutral-2 p-3 rounded-r-xl hover:bg-neutral-3 transition-colors cursor-pointer"
              >
                <p className="text-sm font-medium text-black">"{note.text}"</p>
                <span className="text-[10px] text-neutral-500 block mt-1">
                  Nel file: {note.docTitle} • Pagina {note.page}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEZIONE 4: EVIDENZIAZIONI DI TESTO */}
      {globalSearchData?.textData && globalSearchData.textData.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          <span className="text-xs font-bold uppercase text-neutral-4 tracking-wider flex items-center gap-1">
            💡 Citazioni ed Evidenziazioni
          </span>
          <div className="flex flex-col gap-2">
            {globalSearchData.textData.map((h: any) => (
              <div
                key={h.page_id}
                className="bg-[#FDE047]/20 border-l-4 border-[#FDE047] p-3 rounded-r-xl cursor-pointer"
              >
                <p className="text-sm font-medium text-text-1 italic">
                  {h.text}
                </p>
                <span className="text-[10px] text-neutral-500 block mt-1">
                  Pagina {h.page_number}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEZIONE 5: TAG E GRAFO */}
      {globalSearchData?.tags && globalSearchData.tags.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          <span className="text-xs font-bold uppercase text-neutral-4 tracking-wider flex items-center gap-1">
            <Hash size={14} /> Tag del Grafo della conoscenza
          </span>
          <div className="flex flex-row flex-wrap gap-2">
            {globalSearchData.tags.map((tag: string, idx: number) => (
              <div
                key={idx}
                className="bg-light-accent text-accent px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:bg-accent/20 transition-all"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FALLBACK: NESSUN RISULTATO */}
      {globalSearchData?.totalCount === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-neutral-4">
          <p className="text-sm font-medium">
            Nessun elemento corrisponde a "{query}"
          </p>
          <p className="text-xs">Prova a cercare un tag o un'altra nota.</p>
        </div>
      )}
    </div>
  );
};

export default SearchSection;
