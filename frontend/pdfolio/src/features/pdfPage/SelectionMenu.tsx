import React, { useRef, useState } from "react";

interface SelectionMenuProps {
  menuX: number;
  menuY: number;
  onHighlight: (color: string) => void; // Ora accetta il colore scelto
  onNote: () => void;
  onCopy: () => void;
  onAskAi: (type: "explain" | "simplify" | "example") => void;
}

const SelectionMenu = ({
  menuX,
  menuY,
  onHighlight,
  onNote,
  onCopy,
  onAskAi,
}: SelectionMenuProps) => {
  const [showAiDropdown, setShowAiDropdown] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowAiDropdown(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowAiDropdown(false);
    }, 150); // Ottimo bilanciamento di tolleranza
  };

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

  return (
    <div
      className="absolute z-50 flex flex-col items-center -translate-x-1/2 -translate-y-full"
      style={{
        top: `${menuY}px`,
        left: `${menuX}px`,
      }}
      onMouseDown={(e) => e.preventDefault()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* RETTANGOLO SELEZIONE COLORI (Compare sopra il menu principale) */}
      {showColorPicker && (
        <div className="bg-neutral-1 dark:bg-zinc-950 border border-neutral-4 dark:border-zinc-800 rounded-xl shadow-lg p-2 flex flex-row items-center gap-2 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200 px-2 py-2 transition-colors duration-300">
          <span className="text-xs font-semibold text-black dark:text-zinc-300 px-1">
            Colore:
          </span>
          {colors.map((color) => (
            <button
              key={color.id}
              title={color.label}
              onClick={(e) => {
                e.stopPropagation();
                onHighlight(color.value); // Passa il colore selezionato al componente padre
                setShowColorPicker(false); // Chiude il picker dopo la selezione
              }}
              className={`w-6 h-6 rounded-full cursor-pointer transition-all hover:scale-110 ${color.className}`}
            />
          ))}
          <div className="w-[1px] h-4 bg-neutral-4 dark:bg-zinc-800 mx-0.5"></div>
          {/* Tasto per annullare e tornare indietro */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(false);
            }}
            className="text-[10px] uppercase tracking-wider font-bold text-black dark:text-zinc-400 hover:text-neutral-700 dark:hover:text-zinc-200 px-1 cursor-pointer transition-colors"
          >
            Annulla
          </button>
        </div>
      )}

      {/* MENU PRINCIPALE */}
      <div className="bg-neutral-1 dark:bg-zinc-900 border border-neutral-4 dark:border-zinc-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-row items-center p-1.5 animate-in fade-in zoom-in-95 duration-200 transition-colors duration-300">
        {/* Tasto Evidenzia */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowColorPicker(!showColorPicker); // Apre/Chiude la barra dei colori
          }}
          className={`flex flex-row items-center gap-2 px-3 py-2 text-black dark:text-zinc-200 rounded-lg transition-all text-sm font-medium cursor-pointer ${
            showColorPicker
              ? "bg-neutral-3 dark:bg-zinc-800"
              : "hover:bg-neutral-3 dark:hover:bg-zinc-800"
          }`}
        >
          <span className="flex items-center gap-1.5">Evidenzia</span>
        </button>

        <div className="w-[1px] h-4 bg-neutral-4 dark:bg-zinc-800 mx-1 rounded-full"></div>

        {/* Tasto Aggiungi Nota */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNote();
          }}
          className="flex flex-row items-center gap-2 px-3 py-2 hover:bg-neutral-3 dark:hover:bg-zinc-800 text-black dark:text-zinc-200 rounded-lg transition-all text-sm font-medium cursor-pointer"
        >
          <span>Nota</span>
        </button>

        <div className="w-[1px] h-4 bg-neutral-4 dark:bg-zinc-800 mx-1 rounded-full"></div>

        {/* TASTO AI CON DROPDOWN COMPATTO */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAiDropdown(!showAiDropdown);
            }}
            className={`flex flex-row items-center gap-1 px-3 py-2 text-black dark:text-zinc-200 rounded-lg transition-all text-sm font-medium cursor-pointer ${
              showAiDropdown
                ? "bg-neutral-3 dark:bg-zinc-800"
                : "hover:bg-neutral-3 dark:hover:bg-zinc-800"
            }`}
          >
            <span>Chiedi all'AI</span>
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${showAiDropdown ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* TENDINA NOTION-STYLE */}
          {showAiDropdown && (
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-zinc-950 border border-neutral-3 dark:border-zinc-800 rounded-xl shadow-lg p-1 flex flex-col gap-0.5 z-[60] animate-in fade-in slide-in-from-top-2 duration-150 transition-colors duration-300"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAskAi("explain");
                  setShowAiDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-800 dark:text-zinc-300 hover:bg-neutral-2 dark:hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
              >
                <span className="ml-1">Spiega nel dettaglio</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAskAi("simplify");
                  setShowAiDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-800 dark:text-zinc-300 hover:bg-neutral-2 dark:hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
              >
                <span className="ml-1">Semplifica concetto</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAskAi("example");
                  setShowAiDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-800 dark:text-zinc-300 hover:bg-neutral-2 dark:hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
              >
                <span className="ml-1">Fai un esempio</span>
              </button>
            </div>
          )}
        </div>

        <div className="w-[1px] h-4 bg-neutral-4 dark:bg-zinc-800 mx-1 rounded-full"></div>

        {/* Tasto Copia */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCopy();
          }}
          className="flex flex-row items-center gap-2 px-3 py-2 hover:bg-neutral-3 dark:hover:bg-zinc-800 text-black dark:text-zinc-200 rounded-lg transition-all text-sm font-medium cursor-pointer"
        >
          <span>Copia</span>
        </button>
      </div>
    </div>
  );
};

export default SelectionMenu;
