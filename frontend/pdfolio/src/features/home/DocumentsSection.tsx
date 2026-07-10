import React from "react";
import UploadDialog from "./UploadDialog";
import UploadButton from "@/components/UploadButton";
import HomeDocument from "./HomeDocument";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";

const DocumentsSection = ({}: {}) => {
  const { documentsData } = useDocumentsAndFolders();

  return (
    <div className="w-full flex flex-col gap-4 mt-4">
      <h2 className="text-xl font-semibold text-text-1 dark:text-zinc-100">
        I tuoi documenti
      </h2>

      <div className="grid grid-cols-4 gap-5 w-full items-stretch">
        <UploadDialog icon={<UploadButton />} />

        {documentsData.map((doc) => {
          return (
            <div key={doc.document_id}>
              <HomeDocument {...doc} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentsSection;
