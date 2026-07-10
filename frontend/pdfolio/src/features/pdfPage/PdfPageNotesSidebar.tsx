import React, { useEffect, useMemo, useRef, useState } from "react";
import CrossIcon from "../../icons/CrossIcon";
import Searchbar from "../../components/Searchbar";
import FilterPill from "../home/FilterPill";
import { AnimatePresence, motion } from "framer-motion";
import NotesSidebarElement from "../../components/NotesSidebarElement";
import { useNotes } from "../../contexts/NotesContext";
import SidebarNoteDetailView from "./SidebarNoteDetailView";
import { useApi } from "@/contexts/ApiContext";
import LoadingState from "@/components/states/LoadingState";
import ErrorState from "@/components/states/ErrorState";
const colors = [
  {
    id: "yellow",
    className: "bg-[rgba(253,224,71,0.5)]",
    label: "Giallo",
    value: "rgba(253,224,71,0.5)",
  },
  {
    id: "green",
    className: "bg-[rgba(16,185,129,0.5)]",
    label: "Verde",
    value: "rgba(16,185,129,0.5)",
  },
  {
    id: "blue",
    className: "bg-[rgba(59,130,246,0.5)]",
    label: "Blu",
    value: "rgba(59,130,246,0.5)",
  },
  {
    id: "pink",
    className: "bg-[rgba(244,114,182,0.5)]",
    label: "Rosa",
    value: "rgba(244,114,182,0.5)",
  },
  {
    id: "orange",
    className: "bg-[rgb(249,115,22,0.5)]",
    label: "Arancione",
    value: "rgba(249,115,22,0.5)",
  },
];
const FILTERS = [
  { name: "Tutte" },
  { name: "Note" },
  { name: "Evidenziati" },
  {
    name: "Colore",
    options: colors.map((c) => c.className),
    currentColor: null,
  },
];

const PdfPageNotesSidebar = ({
  toggleNotesSidebar,
  notesContainerRef,
  scrollToNoteInPdf,
}: {
  toggleNotesSidebar: () => void;
  notesContainerRef: React.RefObject<HTMLDivElement>;
  scrollToNoteInPdf: (notePosition: any) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const { notesArray, fetchNotes } = useNotes();
  const [activeNote, setActiveNote] = useState<any | null>(null);
  const { loading, error: errorApi } = useApi();
  const filteredResults = useMemo(() => {
    return notesArray.filter((note) => {
      // 1. Applica il filtro per Tipo (Tab)
      if (selectedFilter.name === "Note" && note.type !== "NOTE") return false;
      if (selectedFilter.name === "Evidenziati" && note.type !== "HIGHLIGHT")
        return false;

      if (
        selectedFilter.name === "Colore" &&
        note.color !== selectedFilter?.currentColor
      )
        return false;

      // 2. Applica la ricerca testuale (se presente)
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();

        if (note.type === "NOTE") {
          const contentMatch = note.content?.toLowerCase().includes(query);
          const textMatch = note.text?.toLowerCase().includes(query);
          return contentMatch || textMatch;
        }

        if (note.type === "HIGHLIGHT") {
          return note.text?.toLowerCase().includes(query);
        }
      }

      return true;
    });
  }, [notesArray, selectedFilter, searchQuery]);

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 500, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full bg-neutral-1 dark:bg-zinc-950 shadow-[-4px_0_15px_rgba(0,0,0,0.05)] dark:shadow-[-6px_0_30px_rgba(0,0,0,0.3)] overflow-hidden border-l border-neutral-4 dark:border-zinc-800 transition-colors duration-300"
    >
      <AnimatePresence mode="wait">
        {activeNote ? (
          <motion.div
            key="detail"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            className="h-full"
          >
            <SidebarNoteDetailView
              note={activeNote}
              onBack={() => setActiveNote(null)}
              scrollToNoteInPdf={scrollToNoteInPdf}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="w-[500px] py-2 h-full flex flex-col"
          >
            <div className="w-[500px] py-2 h-full flex flex-col">
              <div className="flex w-full flex-row justify-between items-center mb-4 border-b border-b-neutral-4 dark:border-b-zinc-800 px-4 py-4 shrink-0 transition-colors">
                <h1 className="text-xl font-bold font-inter text-black dark:text-zinc-100">
                  {" "}
                  Note del documento
                </h1>
                <CrossIcon
                  size={30}
                  className="text-text-1 dark:text-zinc-400 cursor-pointer hover:text-black dark:hover:text-zinc-100 transition-colors"
                  onClick={toggleNotesSidebar}
                />
              </div>

              <div className="px-4 flex flex-col gap-3 flex-1 min-h-0 py-3">
                <Searchbar
                  query={searchQuery}
                  setQuery={setSearchQuery}
                  placeholder="Cerca tra note ed evidenziazioni"
                />
                <div className="flex flex-row gap-2 mt-2">
                  {FILTERS.map((filter, index) => (
                    <div key={filter.name}>
                      <FilterPill
                        label={filter}
                        isActive={selectedFilter.name === filter.name}
                        setSelectedFilter={setSelectedFilter}
                      />
                    </div>
                  ))}
                </div>
                {errorApi?.get_notes ? (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-2 dark:bg-zinc-900">
                    <ErrorState
                      message={errorApi?.get_notes?.message}
                      onRetry={fetchNotes}
                    />
                  </div>
                ) : loading?.get_notes ? (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-2 dark:bg-zinc-900">
                    <LoadingState text={"Recupero delle note..."} />
                  </div>
                ) : (
                  <div
                    className="flex flex-col gap-2 overflow-y-auto py-4 min-h-0 flex-1 scrollbar-thin dark:scrollbar-thumb-zinc-800"
                    ref={notesContainerRef}
                  >
                    {filteredResults.map((note, index) => (
                      <NotesSidebarElement
                        setActiveNote={setActiveNote}
                        key={note.note_id}
                        note={note}
                        scrollToNoteInPdf={scrollToNoteInPdf}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PdfPageNotesSidebar;
