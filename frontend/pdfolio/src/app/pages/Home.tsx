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
const FILTERS = ["Recenti", "Questa settimana", "Questo mese"];

const FolderColors = [
  {
    bg: "bg-blue-400 hover:bg-blue-400/85",
    text: "text-blue-700 group-hover:text-blue-700/85",
  },
  {
    bg: "bg-fuchsia-400 hover:bg-fuchsia-400/85",
    text: "text-fuchsia-700 group-hover:text-fuchsia-700/85",
  },
  {
    bg: "bg-rose-400 hover:bg-rose-400/85",
    text: "text-rose-700 group-hover:text-rose-700/85",
  },
  {
    bg: "bg-sky-400 hover:bg-sky-400/85",
    text: "text-sky-700 group-hover:text-sky-700/85",
  },
  {
    bg: "bg-green-400 hover:bg-green-400/85",
    text: "text-green-700 group-hover:text-green-700/85",
  },
  {
    bg: "bg-amber-400 hover:bg-amber-400/85",
    text: "text-amber-700 group-hover:text-amber-700/85",
  },
];
const Home = () => {
  const { isLoading, activeFolder } = useDocumentsAndFolders();
  const [query, setQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("");

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
          <div className="w-full flex flex-row gap-2 pl-3">
            <div
              className={`px-4 py-2 rounded-2xl  text-sm cursor-pointer transition-colors  duration-200 ${currentFilter == "Icon" ? " bg-light-accent " : " bg-neutral-3 hover:bg-neutral-4"}`}
              onClick={() => {
                setCurrentFilter((prevFilter) =>
                  prevFilter == "Icon" ? "" : "Icon",
                );
              }}
            >
              <FilterIcon
                size={19}
                className={`cursor-pointer ${currentFilter == "Icon" ? "text-accent " : "text-text-1 "} `}
              />
            </div>

            {FILTERS.map((filter, index) => (
              <div
                onClick={() => {
                  setCurrentFilter((prevFilter) =>
                    prevFilter == filter ? "" : filter,
                  );
                }}
                key={index}
              >
                <FilterPill label={filter} isActive={currentFilter == filter} />
              </div>
            ))}
          </div>
        </div>
        {isSearching ? (
          <SearchSection isSearching={isSearching} query={query} />
        ) : (
          <>
            {activeFolder ? (
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
  );
};

export default Home;
