import React, { useEffect, useMemo, useState } from "react";
import { apiCalls } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import Searchbar from "../../components/Searchbar";
import HomeHeader from "../../features/home/HomeHeader";
import FilterPill from "../../features/home/FilterPill";
import { Bookmark, FileText, FilterIcon, Hash } from "lucide-react";
import PlusIcon from "../../icons/PlusIcon";
import Folder from "../../components/Folder";
import ChevronUpIcon from "../../icons/ChevronUpIcon";
import { motion, AnimatePresence } from "framer-motion";
import HomeDocument from "../../features/home/HomeDocument";
import { useNotes } from "@/contexts/NotesContext";
import ErrorDialogComponent from "@/components/ErrorDialogComponent";
import UploadButton from "@/components/UploadButton";
import UploadDialog from "@/features/home/UploadDialog";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import UnorganizedFolder from "@/components/UnorganizedFolder";
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
    <div className=" w-full h-screen overflow-y-auto flex flex-col gap-8 pb-32  ">
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
                <div className="grid grid-cols-4 gap-5 w-full items-stretch">
                  {filteredDocuments.map((doc) => {
                    return <HomeDocument key={doc.document_id} {...doc} />;
                  })}
                </div>
              ) : activeFolder ? (
                <FolderPage />
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
