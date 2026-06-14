import ErrorDialogComponent from "@/components/ErrorDialogComponent";
import React from "react";
import UploadDialog from "./UploadDialog";
import UploadButton from "@/components/UploadButton";
import HomeDocument from "./HomeDocument";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiCalls } from "@/services/api";

const DocumentsSection = ({}: {}) => {
  const { documentsData } = useDocumentsAndFolders();
  const { session } = useAuth();
  const [fileError, setFileError] = useState({
    isOpen: false,
    title: "",
    desc: "",
  });
  const uploadPdf = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      // Svuotiamo l'input per sicurezza
      e.target.value = "";
      setFileError({
        isOpen: true,
        title: "Errore Formato",
        desc: "Il file caricato non è in formato PDF DOC o DOCX",
      });
      return;
    }
    const fileData = new FormData();
    fileData.append("pdfFile", file);

    const response = await apiCalls.pdf.uploadPdfFile(
      session?.access_token,
      fileData,
    );
    if (response.error) {
      console.log("errore file");

      setFileError({
        isOpen: true,
        title: "Errore Upload",
        desc: response?.error?.message,
      });
    }
    console.log("risposta", response);
  };
  return (
    <div className="w-full flex flex-col gap-4 mt-4">
      <h2 className="text-xl font-semibold text-text-1">I tuoi documenti</h2>

      <div className="grid grid-cols-4 gap-5 w-full items-stretch">
        <UploadDialog icon={<UploadButton uploadPdf={uploadPdf} />} />

        {/* Lista Documenti */}
        {documentsData.map((doc) => {
          return <HomeDocument key={doc.document_id} {...doc} />;
        })}
        {fileError.isOpen && (
          <ErrorDialogComponent
            desc={fileError.desc}
            title={fileError.title}
            isOpen={fileError.isOpen}
            setIsOpen={setFileError}
            onAction={() => {
              setFileError({ isOpen: false, title: "", desc: "" });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentsSection;
