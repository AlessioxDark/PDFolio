import { useAuth } from "@/contexts/AuthContext";
import HomeDocument from "@/features/home/HomeDocument";
import TrashIcon from "@/icons/TrashIcon";
import { apiCalls } from "@/services/api";
import { RotateCcw } from "lucide-react";
import React, { useEffect, useState } from "react";

const TrashBin = () => {
  const [loading, setLoading] = useState(true);
  const [deletedDocumentsData, setDeletedDocumentsData] = useState([]);
  const { session } = useAuth();
  const fetchDeletedDocuments = async () => {
    setLoading(true);
    const { data, error } = await apiCalls.pdf.getDeletedDocuments(session);
    if (error) {
      console.error("ERRORE TRASH", error);
    }
    setDeletedDocumentsData(data);
    setLoading(false);
  };
  useEffect(() => {
    fetchDeletedDocuments();
  }, []);

  const handleRestore = async (document_id) => {
    const { error } = await apiCalls.pdf.restorePdfFile(session, document_id);
    if (error) {
      console.error("ERRORE TRASH", error);
    }
    setDeletedDocumentsData((prev) =>
      prev.filter((doc) => doc.document_id !== document_id),
    );
  };

  const handleDeleteForever = async (document_id) => {
    const { error } = await apiCalls.pdf.deletePdfFile(session, document_id);
    if (error) {
      console.error("ERRORE TRASH", error);
    }
    setDeletedDocumentsData((prev) =>
      prev.filter((doc) => doc.document_id !== document_id),
    );
  };
  if (loading) return <div>Loading...</div>;
  return (
    <div className="px-10 py-8 flex flex-col gap-6 w-full h-screen font-inter bg-neutral-50/30">
      {/* Header del Cestino con info utili */}
      <div className="flex flex-col gap-1 border-b border-neutral-200 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <TrashIcon size={30} className="text-neutral-900" /> Cestino
        </h1>
        <p className="text-xs text-neutral-500">
          I documenti qui dentro sono congelati. Ripristinali per poterci
          studiare di nuovo.
        </p>
      </div>

      {deletedDocumentsData.length === 0 ? (
        // Stato vuoto (Empty State) se non ci sono file eliminati
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
          <h3 className="text-sm font-semibold text-neutral-700 mt-2">
            Il cestino è vuoto
          </h3>
          <p className="text-xs text-neutral-400 max-w-xs">
            Ottimo lavoro! Nessun file eliminato di recente.
          </p>
        </div>
      ) : (
        // Griglia dei documenti
        <div className="grid grid-cols-4 gap-4 w-full shrink-0 grow-0">
          {deletedDocumentsData.map((document) => (
            <div
              key={document.document_id}
              className="relative group rounded-xl overflow-hidden"
            >
              {/* Card "Ghost" disabilitata visivamente (Opaca) */}
              <div className="opacity-70 pointer-events-none transition-opacity duration-200 group-hover:opacity-40">
                <HomeDocument {...document} />
              </div>

              <div className="absolute inset-0 bg-neutral-950/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-3">
                <button
                  onClick={() => handleRestore(document.document_id)}
                  title="Ripristina file"
                  className="p-3 bg-light-accent hover:bg-light-accent/80 rounded-xl shadow-md transition-all duration-150 transform flex items-center justify-center cursor-pointer"
                >
                  <RotateCcw size={18} className="text-accent" />
                </button>

                {/* Bottone Elimina Definitivamente */}
                <button
                  onClick={() => handleDeleteForever(document.document_id)}
                  title="Elimina definitivamente"
                  className="p-3 bg-red-50 hover:bg-red-100/70 rounded-xl shadow-md transition-all duration-150 transform  flex items-center justify-center cursor-pointer"
                >
                  {/* <Trash2 size={18} className="text-red-500" /> */}
                  <TrashIcon size={20} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrashBin;
