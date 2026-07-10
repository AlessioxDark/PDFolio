import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotes } from "@/contexts/NotesContext";
import { apiCalls } from "@/services/api";
import { Download, FileText, Loader2 } from "lucide-react";
import { useParams } from "react-router";
import React from "react";
import { toast } from "sonner";

const SummaryPdfMessage = ({ extractedText }) => {
  const { loading, executeApiCall } = useApi();
  const { session } = useAuth();
  const { pdfId } = useParams();
  const isExporting = loading?.export_summary;
  const handleExportPdf = async (summaryText) => {
    executeApiCall(
      "export_summary",
      () => {
        return apiCalls.pdf.exportSummaryPdf(
          session?.access_token,
          pdfId,
          summaryText,
        );
      },
      {
        onError: (error) => {
          console.error("Errore esportazione PDF:", error);
          toast.error(error?.message);
        },
        onSuccess: (data) => {
          const downloadUrl = window.URL.createObjectURL(data);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.setAttribute("download", `Riassunto_${pdfId}.pdf`);

          document.body.appendChild(link);
          link.click();

          link.parentNode?.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
          toast.success("Pdf esportato con successo!");
        },
      },
    );
  };
  return (
    <div className="group relative p-5  bg-neutral-100/50 dark:bg-zinc-950/40 border border-neutral-200 dark:border-zinc-800/80 rounded-2xl my-4  transition-all duration-300 overflow-hidden text-left">
      <div className="flex items-center flex-col justify-between gap-4 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 text-accent dark:bg-purple-500/10 dark:text-purple-400 rounded-xl shrink-0">
            <FileText size={20} className="animate-pulse duration-1000" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-800 dark:text-zinc-200">
              Dispensa Accademica Pronta
            </h3>
            <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-0.5 leading-snug">
              Il riassunto discorsivo strutturato è pronto per il download.
            </p>
          </div>
        </div>
        <button
          disabled={isExporting}
          className="flex items-center gap-2 text-white bg-accent hover:bg-accent/90 dark:bg-purple-600 dark:hover:bg-purple-700 disabled:opacity-60 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 shadow-xs hover:shadow-md active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed select-none whitespace-nowrap ml-auto sm:ml-0"
          onClick={() => handleExportPdf(extractedText)}
        >
          {isExporting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Esportazione...</span>
            </>
          ) : (
            <>
              <Download size={14} />
              <span>Esporta PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SummaryPdfMessage;
