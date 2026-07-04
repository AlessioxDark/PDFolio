import React, { useMemo, useState } from "react";
import Searchbar from "../../components/Searchbar";
import HomeHeader from "../../features/home/HomeHeader";
import FilterPill from "../../features/home/FilterPill";
import HomeDocument from "../../features/home/HomeDocument";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import FolderSection from "@/features/home/FolderSection";
import DocumentsSection from "@/features/home/DocumentsSection";
import FolderPage from "./FolderPage";
import SearchSection from "@/features/home/SearchSection";
import { useSearch } from "@/contexts/SearchContext";
const FILTERS = ["Recenti", "Note", "Evidenziazioni", "Documenti"];
const Home = () => {
  const { isLoading, activeFolder, activeTag, documentsData } =
    useDocumentsAndFolders();
  const [query, setQuery] = useState("");
  const { currentFilter, setCurrentFilter } = useSearch();
  const filteredDocuments = useMemo(() => {
    return documentsData.filter((doc) => doc.tags.includes(activeTag));
  }, [documentsData, activeTag]);
  const isSearching = query.trim().length > 0;

  return isLoading ? (
    <div className="w-full h-screen flex items-center justify-center font-medium text-neutral-500">
      Caricamento in corso...
    </div>
  ) : (
    <div className=" w-full h-screen overflow-y-auto flex flex-col gap-8 pb-32   ">
      <HomeHeader />
      <div className="w-full flex justify-center flex-col items-center gap-10 px-6">
        <div className="w-full flex flex-col gap-2">
          <Searchbar
            query={query}
            setQuery={setQuery}
            placeholder="Cerca tra i documenti, le note o i tag..."
          />

          {isSearching ? (
            <div className="flex flex-col gap-2">
              <div className="w-full flex flex-row gap-2 pl-3">
                {FILTERS.map((filter, index) => (
                  <div
                    onClick={() => {
                      setCurrentFilter((prevFilter) =>
                        prevFilter == filter ? "" : filter,
                      );
                    }}
                    key={index}
                  >
                    <FilterPill
                      label={filter}
                      isActive={currentFilter == filter}
                    />
                  </div>
                ))}
              </div>
              <SearchSection isSearching={isSearching} query={query} />
            </div>
          ) : (
            <>
              {activeTag ? (
                <div className="flex flex-col gap-3 mt-4">
                  <h1 className="font-inter text-xl font-bold pl-3">
                    Tag: #{activeTag}
                  </h1>
                  <div className="grid grid-cols-4 gap-5 w-full items-stretch ">
                    {filteredDocuments.map((doc) => {
                      return <HomeDocument key={doc.document_id} {...doc} />;
                    })}
                  </div>
                </div>
              ) : activeFolder ? (
                <div className="mt-4">
                  <FolderPage />
                </div>
              ) : (
                <>
                  <FolderSection />
                  <DocumentsSection />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
