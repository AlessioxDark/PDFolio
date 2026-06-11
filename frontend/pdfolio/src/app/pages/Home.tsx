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
  const { session } = useAuth();
  const { notesArray } = useNotes();
  const [query, setQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("");
  const [homeData, setHomeData] = useState();
  const [isShown, setIsShown] = useState(false);
  const [searchData, setSearchData] = useState(null);
  const [isHomeLoading, setIsHomeLoading] = useState(false);
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [isFileError, setIsFileError] = useState(false);
  const loadData = async () => {
    if (!session) return; // Evita chiamate se la sessione non è pronta
    setIsHomeLoading(true);
    const { data, error } = await apiCalls.home.getHomeFoldersAndFiles(
      session?.access_token,
    );
    if (error) {
      console.error("Errore nel caricamento:", error);
      setIsHomeLoading(false);

      return;
    }

    if (data) {
      console.log("Dati ricevuti:", data);
      setHomeData(data);
      setIsHomeLoading(false);
    }
  };

  // ==========================================
  // 🔍 MOTORE DI RICERCA GLOBALE AVANZATO (Full-text & Relations)
  // ==========================================
  const searchResults = async () => {
    setIsQueryLoading(true);
    const { data, error } = await apiCalls.home.globalSearch(
      session?.access_token,
      query,
    );
    if (error) {
      console.error("Errore nel caricamento:", error);
      setIsQueryLoading(false);
      return;
    }
    if (data) {
      console.log("Dati ricevuti:", data);
      setSearchData(data);
      setIsQueryLoading(false);
    }
  };
  const uploadPdf = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      // Svuotiamo l'input per sicurezza
      e.target.value = "";
      setIsFileError(true);
      return;
    }
    const fileData = new FormData();
    fileData.append("pdfFile", file);

    const response = await apiCalls.pdf.uploadPdfFile(
      session?.access_token,
      fileData,
    );
  };
  // Controlla se la ricerca ha prodotto dei risultati visualizzabili
  const isSearching = query.trim().length > 0;

  useEffect(() => {
    loadData();
  }, []);

  return isHomeLoading ? (
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
          isQueryLoading ? (
            <div>caricamento query</div>
          ) : (
            <div className="w-7/10 flex flex-col gap-6 bg-white border border-neutral-3 rounded-2xl p-6 shadow-sm min-h-[300px]">
              <div className="flex flex-row justify-between items-center border-b border-neutral-3 pb-3">
                <h3 className="text-sm font-semibold text-neutral-4 font-inter">
                  Risultati per{" "}
                  <span className="text-black italic">"{query}"</span>
                </h3>
                <span className="text-xs bg-neutral-2 px-2 py-1 rounded-md text-text-1">
                  {searchResults?.totalCount || 0} elementi trovati
                </span>
              </div>

              {/* SEZIONE 1: CARTELLE TROVATE */}
              {searchResults?.folders && searchResults.folders.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase text-neutral-4 tracking-wider flex items-center gap-1">
                    {/* <FolderIcon size={14} /> Cartelle */}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {searchResults.folders.map((f: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-neutral-2 hover:bg-neutral-3 p-3 rounded-xl cursor-pointer transition-all"
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${FolderColors[idx % FolderColors.length].bg}`}
                        />
                        <span className="text-sm font-medium text-black">
                          {f.nome}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEZIONE 2: DOCUMENTI TROVATI */}
              {searchResults?.documents &&
                searchResults.documents.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-xs font-bold uppercase text-neutral-4 tracking-wider flex items-center gap-1">
                      <FileText size={14} /> Documenti (PDF)
                    </span>
                    <div className="flex flex-col gap-2">
                      {searchResults.documents.map(
                        (doc: any, index: number) => {
                          const folderIndex = homeData?.foldersData?.findIndex(
                            (f: any) =>
                              f.folder_id === doc.folder_id ||
                              f.id === doc.folder_id,
                          );
                          const colorIndex =
                            folderIndex !== -1 && folderIndex !== undefined
                              ? folderIndex % FolderColors.length
                              : 0;
                          return (
                            <HomeDocument
                              key={index}
                              {...doc}
                              colorIndex={colorIndex}
                            />
                          );
                        },
                      )}
                    </div>
                  </div>
                )}

              {/* SEZIONE 3: NOTE E PENSIERI DELL'UTENTE */}
              {searchResults?.notes && searchResults.notes.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-xs font-bold uppercase text-neutral-4 tracking-wider flex items-center gap-1">
                    <Bookmark size={14} /> I tuoi commenti e note
                  </span>
                  <div className="flex flex-col gap-2">
                    {searchResults.notes.map((note: any) => (
                      <div
                        key={note.id}
                        className="border-l-4 border-accent bg-neutral-2 p-3 rounded-r-xl hover:bg-neutral-3 transition-colors cursor-pointer"
                      >
                        <p className="text-sm font-medium text-black">
                          "{note.text}"
                        </p>
                        <span className="text-[10px] text-neutral-500 block mt-1">
                          Nel file: {note.docTitle} • Pagina {note.page}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEZIONE 4: EVIDENZIAZIONI DI TESTO */}
              {searchResults?.highlights &&
                searchResults.highlights.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-xs font-bold uppercase text-neutral-4 tracking-wider flex items-center gap-1">
                      💡 Citazioni ed Evidenziazioni
                    </span>
                    <div className="flex flex-col gap-2">
                      {searchResults.highlights.map((h: any) => (
                        <div
                          key={h.id}
                          className="bg-[#FDE047]/20 border-l-4 border-[#FDE047] p-3 rounded-r-xl cursor-pointer"
                        >
                          <p className="text-sm font-medium text-text-1 italic">
                            {h.text}
                          </p>
                          <span className="text-[10px] text-neutral-500 block mt-1">
                            Nel file: {h.docTitle} • Pagina {h.page}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* SEZIONE 5: TAG E GRAFO */}
              {searchResults?.tags && searchResults.tags.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-xs font-bold uppercase text-neutral-4 tracking-wider flex items-center gap-1">
                    <Hash size={14} /> Tag del Grafo della conoscenza
                  </span>
                  <div className="flex flex-row flex-wrap gap-2">
                    {searchResults.tags.map((tag: string, idx: number) => (
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
              {searchResults?.totalCount === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-neutral-4">
                  <p className="text-sm font-medium">
                    Nessun elemento corrisponde a "{query}"
                  </p>
                  <p className="text-xs">
                    Prova a cercare un tag o un'altra nota.
                  </p>
                </div>
              )}
            </div>
          )
        ) : (
          <>
            <div className="w-full flex justify-between items-end mb-[-10px]">
              <h2 className="text-xl font-semibold text-text-1">
                Le tue cartelle
              </h2>
            </div>

            <div className="w-full">
              <motion.div
                layout
                initial={false}
                animate={{ height: isShown ? "auto" : "150px" }}
                className="grid grid-cols-6 w-full overflow-hidden gap-y-4 justify-items-center content-start"
              >
                {/* Pulsante Crea Cartella (sempre visibile) */}
                <div
                  className="w-30 h-30 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white border-2 border-dashed border-neutral-300 hover:border-accent hover:bg-neutral-50 transition-all gap-1"
                  onClick={() => {}}
                >
                  <PlusIcon size={24} className="text-accent" />
                  <span className="text-accent text-sm font-medium">
                    Crea cartella
                  </span>
                </div>

                {/* 3. Mappatura dei dati con AnimatePresence per entrate fluide */}
                <AnimatePresence>
                  {homeData?.foldersData
                    ?.slice(0, isShown ? homeData?.foldersData.length : 9)
                    .map((item, itemIndex) => {
                      const colorIndex = itemIndex % FolderColors.length;
                      return (
                        <Folder
                          nome={item.nome}
                          length={item.documenti.length}
                          bgColor={`${FolderColors[colorIndex].bg}`}
                          iconColor={`${FolderColors[colorIndex].text} `}
                        />
                      );
                    })}
                </AnimatePresence>
              </motion.div>

              <div
                className="w-full flex items-center gap-4 py-2 cursor-pointer group"
                onClick={() => setIsShown(!isShown)}
              >
                <div className="flex-1 h-[1px] bg-neutral-3 group-hover:bg-accent/40 transition-colors duration-300" />
                <motion.div
                  animate={{ rotate: isShown ? 0 : 180 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <ChevronUpIcon
                    size={24}
                    className="text-neutral-4 group-hover:text-accent transition-colors duration-300"
                    onClick={() => {}}
                  />
                </motion.div>
                <div className="flex-1 h-[1px] bg-neutral-3 group-hover:bg-accent/40 transition-colors duration-300" />
              </div>
            </div>
            {/* <div className="grid grid-cols-3 gap-4 w-full items-start">
              {" "}
              <div
                className="max-h-60 aspect-square relative rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white border-2 border-dashed border-neutral-300 hover:border-accent hover:bg-neutral-50 transition-all gap-1"
                onClick={() => {}}
              >
                <input
                  type="file"
                  name=""
                  id=""
                  accept=".pdf .doc .docx"
                  className="top-0 w-full h-full absolute opacity-0 cursor-pointer"
                  onChange={uploadPdf}
                />
                <PlusIcon size={40} className="text-accent" />
                <span className="text-accent text-sm font-medium">
                  Importa pdf
                </span>
              </div>
              {isFileError && (
                <ErrorDialogComponent
                  desc={"formato non accettato"}
                  title={"Errore"}
                  isOpen={isFileError}
                  setIsOpen={setIsFileError}
                  onAction={() => {
                    setIsFileError(false);
                  }}
                />
              )}
              {homeData?.documentsData.map((doc, index) => {
                const folderIndex = homeData?.foldersData?.findIndex(
                  (f: any) =>
                    f.folder_id === doc.folder_id || f.id === doc.folder_id,
                );
                const colorIndex =
                  folderIndex !== -1 && folderIndex !== undefined
                    ? folderIndex % FolderColors.length
                    : 0;
                return (
                  <HomeDocument key={index} {...doc} colorIndex={colorIndex} />
                );
              })}
            </div> */}
            <div className="w-full flex flex-col gap-4 mt-4">
              <h2 className="text-xl font-semibold text-text-1">
                I tuoi documenti
              </h2>

              <div className="grid grid-cols-4 gap-5 w-full items-stretch">
                <div className="aspect-square w-full rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white border-2 border-dashed border-neutral-300 hover:border-accent hover:bg-neutral-50 transition-all gap-1 p-4 relative">
                  <input
                    type="file"
                    accept=".pdf, .doc, .docx"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={uploadPdf}
                  />
                  <PlusIcon size={32} className="text-accent" />
                  <span className="text-accent text-sm font-medium text-center">
                    Importa pdf
                  </span>
                </div>

                {/* Lista Documenti */}
                {homeData?.documentsData.map((doc, index) => {
                  const folderIndex = homeData?.foldersData?.findIndex(
                    (f) =>
                      f.folder_id === doc.folder_id || f.id === doc.folder_id,
                  );
                  const colorIndex =
                    folderIndex !== -1 && folderIndex !== undefined
                      ? folderIndex % FolderColors.length
                      : 0;
                  return (
                    <HomeDocument
                      key={index}
                      {...doc}
                      colorIndex={colorIndex}
                    />
                  );
                })}
              </div>
            </div>
            {/* 4. Separatore con Icona Animata */}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
