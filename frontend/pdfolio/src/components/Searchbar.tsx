import { X } from "lucide-react";
import React from "react";

const Searchbar = ({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (value: string) => void;
}) => {
  return (
    <div className="w-7/10 px-1 py-1  rounded-xl bg-linear-to-r from-purple-600 to-indigo-600">
      <div className="w-full h-full bg-white py-2 px-3 rounded-xl flex items-center justify-between">
        <input
          type="text"
          placeholder="Inserisci una parola chiave"
          className="w-full outline-none  border-none "
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query != "" && (
          <X className="cursor-pointer" onClick={() => setQuery("")} />
        )}
      </div>
    </div>
  );
};

export default Searchbar;
