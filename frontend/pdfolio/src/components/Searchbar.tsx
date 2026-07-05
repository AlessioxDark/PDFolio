import React from "react";
import Cross from "../assets/cross-icon.svg";
import CrossIcon from "../icons/CrossIcon";
import { SearchIcon } from "lucide-react";
const Searchbar = ({
  query,
  setQuery,
  placeholder,
}: {
  query: string;
  setQuery: (value: string) => void;
  placeholder: string;
}) => {
  return (
    <div className="w-full px-1 py-1 pl-2 bg-white dark:bg-zinc-950 rounded-full border border-neutral-4 dark:border-zinc-800 focus-within:ring-2 focus-within:ring-accent dark:focus-within:ring-purple-500 group transition-all duration-200">
      <div className="w-full h-full py-2 px-3 rounded-xl flex items-center justify-between gap-4">
        {/* INPUT & ICONA DI RICERCA */}
        <div className="flex flex-row gap-2 w-full">
          <SearchIcon
            size={24}
            className="text-neutral-4 dark:text-zinc-500 group-focus-within:text-accent dark:group-focus-within:text-purple-400 transition-colors shrink-0"
          />
          <input
            type="text"
            placeholder={placeholder}
            className="w-full outline-none border-none bg-transparent text-neutral-600 dark:text-zinc-200 placeholder-neutral-400 dark:placeholder-zinc-500 font-inter text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* PULSANTE RESET (CROSS) */}
        {query !== "" && (
          <CrossIcon
            onClick={() => {
              setQuery("");
            }}
            size={24}
            className="cursor-pointer text-neutral-4 dark:text-zinc-500 hover:text-accent dark:hover:text-purple-400 transition-colors shrink-0"
          />
        )}
      </div>
    </div>
  );
};

export default Searchbar;
