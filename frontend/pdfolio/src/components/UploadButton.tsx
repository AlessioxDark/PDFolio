import { PlusIcon } from "lucide-react";
import React from "react";

const UploadButton = ({
  uploadPdf,
}: {
  uploadPdf: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div className="aspect-square w-full rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white border-2 border-dashed border-neutral-300 hover:border-accent hover:bg-neutral-50 transition-all gap-1 p-4 relative">
      {/* <input
        type="file"
        accept=".pdf, .doc, .docx"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={uploadPdf}
      /> */}
      <PlusIcon size={32} className="text-accent" />
      <span className="text-accent text-sm font-medium text-center">
        Importa pdf
      </span>
    </div>
  );
};

export default UploadButton;
