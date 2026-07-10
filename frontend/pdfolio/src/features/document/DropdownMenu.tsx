import { AlertDialogComponent } from "@/components/AlertDialogComponent";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import React, { useEffect, useEffectEvent, useRef } from "react";

interface DropdownMenuProps {
  setEditMode: (mode: "edit" | "move") => void;
  setIsEditOpen: (isOpen: boolean) => void;
  setShowMenu: (showMenu: boolean) => void;
  document_id: string;
  menuRef: React.RefObject<HTMLDivElement>;
}

const DropdownMenu = ({
  setEditMode,
  setIsEditOpen,
  setShowMenu,
  document_id,
  menuRef,
}: DropdownMenuProps) => {
  const { handleTrashFile } = useDocumentsAndFolders();

  // Chiude il menu quando si clicca fuori da esso
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    // Usiamo mousedown per coerenza con la chiusura rapida
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowMenu, menuRef]);

  return (
    <div
      className="absolute top-8 right-0 z-30 w-48 bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 rounded-xl shadow-xl flex flex-col p-1 gap-0.5 animate-in fade-in   zoom-in-95 duration-100"
      onClick={(e) => {
        e.stopPropagation(); // Evita di far scattare il click del PDF sottostante
      }}
    >
      <button
        className="text-black dark:text-zinc-200 p-2 hover:bg-neutral-100 dark:hover:bg-zinc-700/60 rounded-lg text-left w-full text-xs font-medium transition-colors"
        onClick={() => {
          setEditMode("edit");
          setIsEditOpen(true);
          setShowMenu(false);
        }}
      >
        Modifica
      </button>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <AlertDialogComponent
          icon={
            <button className="text-red-600 dark:text-red-400 p-2 hover:bg-neutral-100 dark:hover:bg-zinc-700/60 rounded-lg text-left w-full text-xs font-medium transition-colors">
              Elimina
            </button>
          }
          title="Vuoi spostare il documento nel cestino?"
          desc="Sei sicuro di spostare il documento nel cestino?"
          onAction={async (e) => {
            await handleTrashFile(document_id);
            setShowMenu(false); // Chiudiamo il menu solo DOPO che l'azione è stata confermata
          }}
        />
      </div>
      <button
        className="text-black dark:text-zinc-200 p-2 hover:bg-neutral-100 dark:hover:bg-zinc-700/60 rounded-lg text-left w-full text-xs font-medium transition-colors"
        onClick={() => {
          setEditMode("move");
          setIsEditOpen(true);
          setShowMenu(false);
        }}
      >
        Sposta
      </button>
    </div>
  );
};

export default DropdownMenu;
