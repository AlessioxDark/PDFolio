import React from "react";

const SelectionMenu = ({
  menuX,
  menuY,
  onHighlight,
  onNote,
  onCopy,
  onAskAi,
}) => {
  return (
    <div
      className="absolute z-50 bg-neutral-1 border border-neutral-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-row items-center p-1.5 -translate-x-1/2 -translate-y-full animate-in fade-in zoom-in-95 duration-200"
      style={{
        top: `${menuY}px`,
        left: `${menuX}px`,
      }}
      // Questo impedisce al clic sul menù di deselezionare il testo prima del tempo
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        onClick={onHighlight}
        className="flex flex-row items-center gap-2 px-3 py-2 hover:bg-neutral-3 text-black rounded-lg transition-all text-sm font-medium group"
      >
        <span>Evidenzia</span>
      </button>
      <div className="w-[1px] h-4 bg-neutral-4 mx-1 rounded-full"></div>
      <button
        onClick={onNote}
        className="flex flex-row items-center gap-2 px-3 py-2 hover:bg-neutral-3 text-black rounded-lg transition-all text-sm font-medium group"
      >
        <span>Nota</span>
      </button>
      <div className="w-[1px] h-4 bg-neutral-4 mx-1 rounded-full"></div>

      <button
        onClick={onAskAi}
        className="flex flex-row items-center gap-2 px-3 py-2 hover:bg-neutral-3 text-black rounded-lg transition-all text-sm font-medium group"
      >
        <span>Spiega con AI</span>
      </button>
      <div className="w-[1px] h-4 bg-neutral-4 mx-1 rounded-full"></div>
      <button
        onClick={onCopy}
        className="flex flex-row items-center gap-2 px-3 py-2 hover:bg-neutral-3 text-black rounded-lg transition-all text-sm font-medium group"
      >
        <span>Copia</span>
      </button>
    </div>
  );
};

export default SelectionMenu;
