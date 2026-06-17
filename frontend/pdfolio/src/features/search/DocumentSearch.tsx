import { useSearch } from "@/contexts/SearchContext";
import React from "react";
import HomeDocument from "../home/HomeDocument";

const DocumentSearch = () => {
  const { globalSearchData } = useSearch();
  return (
    globalSearchData?.documentsData &&
    globalSearchData.documentsData.length > 0 && (
      <div className="flex flex-col gap-3 mt-2 animate-fadeIn">
        <span className="text-xs font-inter font-bold uppercase text-text-1 tracking-wider flex items-center gap-1.5">
          Documenti ({globalSearchData.documentsData.length})
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full items-stretch">
          {globalSearchData.documentsData.map((doc: any, index: number) => (
            <div key={index}>
              <HomeDocument {...doc} />
            </div>
          ))}
        </div>
      </div>
    )
  );
};

export default DocumentSearch;
