import React, {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import CrossIcon from "../../icons/CrossIcon";
import Searchbar from "../../components/Searchbar";
import FilterPill from "../home/FilterPill";
import { AnimatePresence, motion } from "framer-motion";
import NotesSidebarElement from "../../components/NotesSidebarElement";
import { useNotes } from "../../contexts/NotesContext";
import SidebarNoteDetailView from "./SidebarNoteDetailView";

const FILTERS = ["Tutte", "Note", "Evidenziati"];

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
  const { notesArray } = useNotes();
  const [activeNote, setActiveNote] = useState<any | null>(null);
  // const [filteredResults, setFilteredResults] = useState(notesArray);
  const filteredResults = useMemo(() => {
    return notesArray.filter((note) => {
      // 1. Applica il filtro per Tipo (Tab)
      if (selectedFilter === "Note" && note.type !== "NOTE") return false;
      if (selectedFilter === "Evidenziati" && note.type !== "HIGHLIGHT")
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
      className="h-full bg-neutral-1 shadow-[-4px_0_15px_rgba(0,0,0,0.05)] overflow-hidden border-l border-neutral-4"
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
              <div className="flex w-full flex-row justify-between items-center mb-4 border-b border-b-neutral-4 px-4 py-4 shrink-0">
                <h1 className="text-xl font-bold font-inter text-black">
                  Note del documento
                </h1>
                <CrossIcon
                  size={30}
                  className="text-text-1 cursor-pointer hover:text-black transition-colors"
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
                    <div key={index} onClick={() => setSelectedFilter(filter)}>
                      <FilterPill
                        label={filter}
                        isActive={selectedFilter === filter}
                      />
                    </div>
                  ))}
                </div>

                <div
                  className="flex flex-col gap-2 overflow-y-scroll py-4 min-h-0 flex-1"
                  ref={notesContainerRef}
                >
                  {filteredResults.map((note, index) => (
                    <NotesSidebarElement
                      setActiveNote={setActiveNote}
                      key={index}
                      note={note}
                      scrollToNoteInPdf={scrollToNoteInPdf}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PdfPageNotesSidebar;
