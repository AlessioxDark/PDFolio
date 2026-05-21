import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Configurazione del worker (indispensabile per processare il PDF)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfThumbnailProps {
  fileUrl: string;
}

const PdfThumbnail = ({ fileUrl }: PdfThumbnailProps) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="h-[250px] w-[230px] flex items-start justify-center overflow-hidden bg-neutral-100 rounded-xl relative group border-2 border-[#E2E8F0]">
      {/* Stato di caricamento (Skeleton o Spinner) */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-200 animate-pulse rounded-xl">
          <span className="text-xs text-neutral-500 font-medium">
            Generando anteprima...
          </span>
        </div>
      )}

      <Document
        file={fileUrl}
        onLoadSuccess={() => setLoading(false)}
        loading={<div />} // Vuoto perché usiamo lo skeleton sopra
        error={
          <div className="text-xs text-red-500 p-2 text-center">
            Errore caricamento
          </div>
        }
      >
        {/* Renderizziamo SOLO la pagina 1, rimuovendo i layer di testo e annotazioni */}
        <Page
          pageNumber={1}
          width={150} // Adatta la larghezza in pixel in base a quanto grande vuoi la "foto"
          renderTextLayer={false} // Rimuove la selezione del testo (lo rende una foto)
          scale={window.devicePixelRatio || 1} // Raddoppia o triplica i pixel interni sui display Retina
          renderAnnotationLayer={false} // Rimuove i link cliccabili
        />
      </Document>

      {/* Overlay opzionale al passaggio del mouse (effetto foto/galleria) */}
    </div>
  );
};

export default PdfThumbnail;
