import React, { useEffect, useState } from "react";
import { apiCalls } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import Searchbar from "../../components/Searchbar";
import HomeHeader from "../../features/home/HomeHeader";
import FilterPill from "../../features/home/FilterPill";
import { FilterIcon } from "lucide-react";
import PlusIcon from "../../icons/PlusIcon";
import Folder from "../../components/Folder";
import ChevronUpIcon from "../../icons/ChevronUpIcon";
import { motion, AnimatePresence } from "framer-motion";
import HomeDocument from "../../features/home/HomeDocument";
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
  const [query, setQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("");
  const [homeData, setHomeData] = useState();
  const [isShown, setIsShown] = useState(false);

  const loadData = async () => {
    if (!session) return; // Evita chiamate se la sessione non è pronta

    const { data, error } = await apiCalls.home.getHomeFoldersAndFiles(
      session?.access_token,
    );
    if (error) {
      console.error("Errore nel caricamento:", error);
      return;
    }

    if (data) {
      console.log("Dati ricevuti:", data);
      setHomeData(data);
    }
  };
  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className=" w-full h-screen overflow-y-auto flex flex-col gap-8 pb-32 ">
      <HomeHeader />
      <div className="w-full flex justify-center flex-col items-center gap-10">
        <div className="w-7/10 flex flex-col gap-2">
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
        {/* 1. Header della sezione */}
        <div className="w-7/10 flex justify-between items-end mb-[-10px]">
          <h2 className="text-xl font-semibold text-text-1">Le tue cartelle</h2>
        </div>

        {/* 2. La Griglia Animata */}

        <div className="w-15/20">
          <motion.div
            layout
            initial={false}
            animate={{ height: isShown ? "auto" : "262px" }}
            className="grid grid-cols-5 w-full overflow-hidden gap-y-4 justify-items-center content-start"
          >
            {/* Pulsante Crea Cartella (sempre visibile) */}
            <div
              className="w-30 h-30 rounded-lg flex items-center justify-center cursor-pointer hover:bg-neutral-3 transition-colors"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='8' ry='8' stroke='%23CBD5E1' stroke-width='2' stroke-dasharray='6%2c 4' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
              }}
              onClick={() => {}}
            >
              <div className="flex flex-col items-center">
                <PlusIcon size={34} className="text-accent" />
                <span className="text-accent text-sm">crea cartella</span>
              </div>
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
        <div className="w-7/10">
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
        </div>
        {/* 4. Separatore con Icona Animata */}
      </div>
    </div>
  );
};

export default Home;
