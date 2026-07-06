import ChevronUpIcon from "@/icons/ChevronUpIcon";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import React from "react";
import HomeDocument from "@/features/home/HomeDocument";
import UploadButton from "@/components/UploadButton";
import UploadDialog from "@/features/home/UploadDialog";
import { AlertDialogComponent } from "@/components/AlertDialogComponent";
import { apiCalls } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/contexts/ApiContext";
import LoadingState from "@/components/states/LoadingState";

const FolderPage = () => {
  const {
    activeFolder,
    setActiveFolder,
    setFoldersData,
    setUnorganizedFolderData,
  } = useDocumentsAndFolders();
  const { session } = useAuth();
  const { executeApiCall, loading } = useApi();
  const handleDeleteFolder = async () => {
    const onSuccess = (data) => {
      setFoldersData((prev) => {
        return prev.filter((f) => f.folder_id !== activeFolder.folder_id);
      });
      setUnorganizedFolderData((prev) => {
        return {
          ...prev,
          documenti:
            activeFolder.documenti?.length > 0
              ? [...prev.documenti, ...activeFolder.documenti]
              : prev.documenti,
        };
      });
      setActiveFolder(null);
    };

    await executeApiCall(
      "delete_folder",
      () => {
        return apiCalls.folder.deleteFolder(session, activeFolder.folder_id);
      },
      { onSuccess },
    );

    console.log("Folder deleted successfully");
  };

  if (loading?.delete_folder) {
    return <LoadingState text={"Eliminando cartella"} />;
  }
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="w-full justify-between flex flex-row items-center">
        <div className="w-full flex flex-row gap-2 items-center">
          <ChevronUpIcon
            className="rotate-270 text-black cursor-pointer dark:text-zinc-200"
            size={30}
            onClick={() => {
              setActiveFolder(null);
            }}
          />
          <span className="font-inter text-neutral-800 font-medium text-xl dark:text-zinc-200">
            {activeFolder.nome}
          </span>
        </div>

        {activeFolder?.folder_id !== null && (
          <AlertDialogComponent
            icon={
              <button className="font-inter cursor-pointer font-medium transition-colors duration-300 hover:bg-red-500/80 bg-red-500 px-3 py-1 text-sm rounded-lg text-white">
                Elimina cartella
              </button>
            }
            title={"Eliminazione cartella"}
            desc={
              "Sei sicuro di voler eliminare la cartella? I file al suo interno verranno trasferiti nella cartella Non Organizzati"
            }
            onAction={handleDeleteFolder}
          />
        )}
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
