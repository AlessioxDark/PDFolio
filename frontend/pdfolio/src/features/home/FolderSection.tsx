import Folder from "@/components/Folder";
import UnorganizedFolder from "@/components/UnorganizedFolder";
import ChevronUpIcon from "@/icons/ChevronUpIcon";
import FolderIcon from "@/icons/FolderIcon";
import PlusIcon from "@/icons/PlusIcon";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { apiCalls } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/contexts/ApiContext";
import { toast } from "sonner";

const FolderSection = () => {
  const [isShown, setIsShown] = useState(false);
  const { foldersData, setFoldersData, FolderColors } =
    useDocumentsAndFolders();
  const [isCreating, setIsCreating] = useState(false);
  const [colorIndex, setColorIndex] = useState<null | number>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { session } = useAuth();
  const { executeApiCall } = useApi();
  const newFolderId = crypto.randomUUID();
  const handleSaveFolder = async () => {
    if (newFolderName.length < 5) return;

    setFoldersData((prev) => [
      {
        nome: newFolderName,
        documenti: [],
        colors: FolderColors[colorIndex],
        folder_id: newFolderId,
      },
      ...prev,
    ]);
    setIsCreating(false);

    await executeApiCall(
      "create_folder",
      () =>
        apiCalls.folder.createFolder(session, {
          nome: newFolderName,
          folder_id: newFolderId,
          color_index: colorIndex,
        }),
      {
        onSuccess: (data) => {
          console.log("Cartella salvata con successo:", data);
        },
        onError: (error) => {
          console.error("Errore durante il salvataggio:", error);
          toast.error(error?.message);
          setFoldersData((prev) =>
            prev.filter((f) => f.folder_id !== newFolderId),
          );

          setNewFolderName("");
          setIsCreating(true);
        },
        startLoading: false,
      },
    );

    setNewFolderName("");
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveFolder();
    } else if (e.key === "Escape") {
      setIsCreating(false);
      setNewFolderName("");
    }
  };

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  return (
    <div className="flex flex-col gap-4 mt-4">
      <h2 className="text-xl font-semibold text-text-1 dark:text-zinc-100">
        Le tue cartelle
      </h2>

      <div className="w-full">
        <motion.div
          layout
          initial={false}
          animate={{ height: isShown ? "auto" : "150px" }}
          className="grid grid-cols-6 w-full overflow-hidden gap-y-4 justify-items-center content-start"
        >
          {/* Pulsante Crea Cartella (sempre visibile) */}
          <div
            className="w-30 h-30 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white dark:bg-zinc-900/30 border-2 border-dashed border-neutral-300 dark:border-zinc-800 hover:border-accent dark:hover:border-purple-500 hover:bg-neutral-50 dark:hover:bg-zinc-800/40 transition-all gap-1"
            onClick={() => {
              setColorIndex(Math.floor(Math.random() * 6));
              setIsCreating(true);
            }}
          >
            <PlusIcon size={24} className="text-accent dark:text-purple-500" />
            <span className="text-accent dark:text-purple-500 text-sm font-medium">
              Crea cartella
            </span>
          </div>

          {/* 3. Mappatura dei dati con AnimatePresence per entrate fluide */}
          <AnimatePresence>
            <UnorganizedFolder />
            {isCreating && (
              <motion.div
                className={`flex flex-col w-32 h-30 items-center justify-end rounded-2xl pb-3 relative cursor-pointer ${FolderColors[colorIndex].bg} transition-colors duration-300 group`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="w-[70px] flex flex-col items-center">
                  <FolderIcon
                    className={` transition-colors duration-300 ${FolderColors[colorIndex].text}`}
                    size={70}
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onBlur={handleSaveFolder} // Salva se l'utente clicca fuori
                    onKeyDown={handleKeyDown} // Salva con Invio, annulla con Esc
                    placeholder="Nome..."
                    maxLength={80}
                    className="w-full font-inter text-center text-sm font-medium text-white border border-neutral-200 rounded px-1 py-0.5 focus:outline-none"
                  />
                  {/* <span className="font-inter text-white text-sm text-center w-full font-medium line-clamp-1">
                    {nome}
                  </span> */}
                </div>
                <span className="font-inter text-white text-base absolute top-1.5 right-3 font-bold ">
                  0
                </span>
              </motion.div>
            )}
            {foldersData
              ?.slice(0, isShown ? foldersData.length : 9)
              .map((item) => {
                console.log("item", item);

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
          <div className="flex-1 h-[1px] bg-neutral-3 dark:bg-zinc-800 group-hover:bg-accent/40 dark:group-hover:bg-purple-500/40 transition-colors duration-300" />
          <motion.div
            animate={{ rotate: isShown ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <ChevronUpIcon
              size={24}
              className="text-neutral-4 dark:text-zinc-500 group-hover:text-accent dark:group-hover:text-purple-400 transition-colors duration-300"
            />
          </motion.div>
          <div className="flex-1 h-[1px] bg-neutral-3 dark:bg-zinc-800 group-hover:bg-accent/40 dark:group-hover:bg-purple-500/40 transition-colors duration-300" />{" "}
        </div>
      </div>
    </div>
  );
};

export default FolderSection;
