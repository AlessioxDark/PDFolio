import Folder from "@/components/Folder";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import { useSearch } from "@/contexts/SearchContext";
import React from "react";

const FolderSearch = () => {
  const { FolderColors } = useDocumentsAndFolders();
  const { globalSearchData } = useSearch();
  return (
    globalSearchData?.foldersData &&
    globalSearchData.foldersData.length > 0 && (
      <div className="flex flex-col gap-3 animate-fadeIn">
        <span className="text-xs font-inter font-bold uppercase text-text-1 tracking-wider flex items-center gap-1.5 ">
          Cartelle ({globalSearchData.foldersData.length})
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {globalSearchData.foldersData.map((folder: any) => (
            <div key={folder.folder_id}>
              <Folder
                {...folder}
                colors={FolderColors[folder?.color_index || 0]}
              />
            </div>
          ))}
        </div>
      </div>
    )
  );
};

export default FolderSearch;
