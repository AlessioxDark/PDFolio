import ChevronUpIcon from "@/icons/ChevronUpIcon";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import React from "react";
import HomeDocument from "@/features/home/HomeDocument";
import UploadButton from "@/components/UploadButton";
import UploadDialog from "@/features/home/UploadDialog";

const FolderPage = () => {
  const { activeFolder, setActiveFolder } = useDocumentsAndFolders();
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="w-full flex flex-row gap-2 items-center">
        <ChevronUpIcon
          className="rotate-270 text-black cursor-pointer"
          size={30}
          onClick={() => {
            setActiveFolder(null);
          }}
        />
        <span className="font-inter text-neutral-800 font-medium text-xl">
          {activeFolder.nome}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-5 w-full items-stretch">
        <UploadDialog
          icon={<UploadButton />}
          chosenFolder={activeFolder.folder_id || "UNORGANIZED"}
        />

        {activeFolder.documenti?.map((doc: any) => (
          <HomeDocument key={doc.id} {...doc} />
        ))}
      </div>
    </div>
  );
};

export default FolderPage;
