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
    <div className="w-full px-1 py-1 pl-2  rounded-full border border-neutral-4 focus-within:ring-2  focus-within:ring-accent  group">
      <div className="w-full h-full  py-2 px-3 rounded-xl flex items-center justify-between gap-4 ">
        <div className="flex flex-row gap-2 w-full">
          <SearchIcon size={24} className="text-neutral-4" />
          <input
            type="text"
            placeholder={placeholder}
            className="w-full outline-none  border-none text-neutral-600"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {query != "" && (
          <CrossIcon
            onClick={() => {
              setQuery("");
            }}
            size={24}
            className=" cursor-pointer text-neutral-4 hover:text-accent"
          />
        )}
      </div>
    </div>
  );
};

export default Searchbar;
