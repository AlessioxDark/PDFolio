import { PlusIcon } from "lucide-react";
import React from "react";

const UploadButton = () => {
  return (
    <div
      className="aspect-square w-full rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white border-2 border-dashed border-neutral-300 hover:border-accent hover:bg-neutral-50 transition-all gap-1 p-4 relative dark:bg-zinc-900/30 dark:hover:border-purple-500
dark:hover:bg-zinc-800/40
dark:border-zinc-800"
    >
      <PlusIcon size={32} className="text-accent dark:text-purple-500" />
      <span className="text-accent text-sm dark:text-purple-500 font-medium text-center">
        Importa pdf
      </span>
    </div>
  );
};

export default UploadButton;
