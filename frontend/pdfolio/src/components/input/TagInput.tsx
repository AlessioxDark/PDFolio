import { XIcon } from "lucide-react";
import React, { useState } from "react";

const TagInput = ({ currentTags, setCurrentTags, disabled }) => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();

      if (!currentTags.includes(inputValue.trim())) {
        setCurrentTags((prev) => [...prev, inputValue.trim()]);
      }
      setInputValue("");
    } else if (
      e.key === "Backspace" &&
      inputValue === "" &&
      currentTags.length > 0
    ) {
      // Chicca UX: se premi Backspace e l'input è vuoto, cancella l'ultimo tag inserito
      setCurrentTags((prev) => prev.slice(0, -1));
    }
  };
  const removeTag = (indexToRemove) => {
    setCurrentTags((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };
  return (
    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
      <label className="font-inter text-[11px] font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
        Tags
      </label>
      <div className="w-full flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 dark:border-zinc-800 p-2 bg-white dark:bg-zinc-950/20 focus-within:ring-1 focus-within:ring-accent dark:focus-within:ring-purple-500 focus-within:border-accent dark:focus-within:border-purple-500 transition-all min-h-[46px]">
        {" "}
        {/* 🏷️ LISTA DELLE PILLOLE */}
        {currentTags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-neutral-100 dark:bg-zinc-900/20 text-neutral-800 dark:text-zinc-200 text-xs font-semibold px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-zinc-700 animate-in zoom-in-95 duration-150"
          >
            <span>#{tag}</span>
            <XIcon
              onClick={() => removeTag(index)}
              className="text-neutral-400 dark:text-zinc-500 hover:text-neutral-600 dark:hover:text-zinc-300 rounded-full hover:bg-neutral-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              size={12}
            />
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={currentTags.length === 0 ? "Es. Economia" : ""}
          className="flex-1 min-w-[120px] bg-transparent text-sm font-semibold text-neutral-800 dark:text-zinc-200 focus:outline-none p-1 placeholder-neutral-400 dark:placeholder-zinc-600"
        />
      </div>
    </div>
  );
};

export default TagInput;
