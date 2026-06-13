import Folder from "@/components/Folder";
import UnorganizedFolder from "@/components/UnorganizedFolder";
import ChevronUpIcon from "@/icons/ChevronUpIcon";
import PlusIcon from "@/icons/PlusIcon";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";

const FolderSection = () => {
  const [isShown, setIsShown] = useState(false);
  const { foldersData } = useDocumentsAndFolders();
  return (
    <>
      <div className="w-full flex justify-between items-end mb-[-10px]">
        <h2 className="text-xl font-semibold text-text-1">Le tue cartelle</h2>
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
            <UnorganizedFolder />
            {foldersData
              ?.slice(0, isShown ? foldersData.length : 9)
              .map((item) => {
                return (
                  <Folder
                    folder={item}
                    nome={item.nome}
                    length={item.documenti.length}
                    colors={item.colors}
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
    </>
  );
};

export default FolderSection;
