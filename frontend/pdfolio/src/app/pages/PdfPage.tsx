import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { apiCalls } from "../../services/api";
import PdfPageHeader from "../../features/pdfPage/pdfPageHeader";
import { Document, Page, pdfjs } from "react-pdf";
import { AnimatePresence } from "framer-motion";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import PdfPageNotesSidebar from "../../features/pdfPage/PdfPageNotesSidebar";
import SelectionMenu from "../../features/pdfPage/SelectionMenu";
import { useNotes } from "../../contexts/NotesContext";
import UnderlinedElement from "../../components/UnderlinedElement";
import PdfPageAiSidebar from "@/features/pdfPage/PdfPageAiSidebar";
import LoadingState from "@/components/states/LoadingState";
import { useApi } from "@/contexts/ApiContext";
import ErrorState from "@/components/states/ErrorState";
import { useNavigationPdf } from "@/hooks/useNavigationPdf";
import { useTextSelection } from "@/hooks/useTextSelection";
import { useAiNotesFeatures } from "@/hooks/useAiNotesFeatures";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfPage = () => {
  const { pdfId } = useParams();
  const { session } = useAuth();
  const [pdfData, setPdfData] = useState<any>({});
  const [activeSidebar, setActiveSidebar] = useState<"" | "AI" | "NOTES">("");
  const { notesArray } = useNotes();

  const notesContainerRef = useRef<HTMLDivElement>(null);
  const [aiMessages, setAiMessages] = useState([]);
  const prevNotesRef = useRef(notesArray);

  const { executeApiCall, loading, error: apiError } = useApi();

  const getPdfData = async () => {
    if (!session) return;

    await executeApiCall(
      "get_pdf",
      () => {
        return apiCalls.pdf.getPdfFile(session, pdfId as string);
      },
      {
        onSuccess: (data) => {
          setPdfData(data);
          setAiMessages([
            {
              role: "assistant",
              content:
                "Ciao! Sono il tuo assistente. Chiedimi pure qualsiasi cosa sul PDF.",
              selection_data: null,
            },
            ...data?.aiMessages,
          ]);
        },
        onError: (error) => {
          console.error("Errore nel caricamento:", error);
        },
      },
    );
  };
  const {
    numPages,
    pageNumber,
    handleInputChange,
    scale,
    scrollContainerRef,
    onDocumentLoadSuccess,
    handleScroll,
    scrollToPage,
    scrollToNoteInPdf,
  } = useNavigationPdf({ pdfId, getPdfData });

  const {
    handleTextSelection,
    handleUnderlineAction,
    handleAddNoteAction,
    handleCopyAction,
    selectionData,
    setSelectionData,
  } = useTextSelection({
    pdfId,
    scrollContainerRef,
    scale,
    pageNumber,
    setActiveSidebar,
  });

  const { onAskAi, onSaveAsNote, onReject, onUpdateNote } = useAiNotesFeatures({
    setActiveSidebar,
    selectionData,
    setSelectionData,
    setAiMessages,
    pdfId,
  });

  const toggleNotesSidebar = () =>
    setActiveSidebar((prev) => (prev === "NOTES" ? "" : "NOTES"));

  const toggleAiSidebar = () =>
    setActiveSidebar((prev) => (prev === "AI" ? "" : "AI"));

  useEffect(() => {
    // Trova le note che c'erano prima ma non ci sono più adesso
    const deletedNotes = prevNotesRef.current.filter(
      (prevNote) => !notesArray.some((n) => n.note_id === prevNote.note_id),
    );

    if (deletedNotes.length > 0) {
      // Per ogni nota eliminata, ripristina lo stato dei messaggi AI associati
      setAiMessages((prev) =>
        prev.map((msg) => {
          if (!msg.selection_data) return msg;
          const sd =
            typeof msg.selection_data === "string"
              ? (() => {
                  try {
                    return JSON.parse(msg.selection_data);
                  } catch {
                    return null;
                  }
                })()
              : msg.selection_data;

          const matchesDeleted = deletedNotes.some(
            (dn) => sd && sd.text === dn.text,
          );

          if (matchesDeleted) {
            return {
              ...msg,
              selection_data: {
                ...sd,
                isSaved: false,
                isModified: false,
                isRejected: false,
              },
            };
          }
          return msg;
        }),
      );
    }

    prevNotesRef.current = notesArray;
  }, [notesArray]);

  const scrollToNoteInSidebar = (notePos: any) => {
    setActiveSidebar("NOTES");
    setTimeout(() => {
      const index = notesArray.findIndex(
        (n) =>
          n.position &&
          n.position.page === notePos.page &&
          n.position.x === notePos.x &&
          n.position.y === notePos.y,
      );
      if (index !== -1 && notesContainerRef.current) {
        const child = notesContainerRef.current.children[index] as HTMLElement;
        if (child) {
          child.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    }, 100);
  };

  if (apiError?.get_pdf) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-neutral-2 dark:bg-zinc-900">
        <ErrorState message={apiError?.get_pdf?.message} onRetry={getPdfData} />
      </div>
    );
  }
  if (loading?.get_pdf && !pdfData?.file_url) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-neutral-2 dark:bg-zinc-900">
        <LoadingState text={"Caricamento documento..."} />
      </div>
    );
  }
  return (
    <div className="w-full h-screen bg-neutral-3 dark:bg-zinc-950 flex flex-col overflow-hidden transition-colors duration-300">
      {" "}
      <PdfPageHeader
        nome={pdfData?.nome}
        toggleNotesSidebar={toggleNotesSidebar}
        toggleAiSidebar={toggleAiSidebar}
        edited_at={pdfData?.edited_at}
        documentId={pdfId}
      />
      <div className="flex-1 w-full flex flex-row overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onMouseUp={handleTextSelection}
            className="flex-1 w-full overflow-auto bg-neutral-2 dark:bg-zinc-900 flex flex-col items-center py-6 relative transition-colors duration-300"
          >
            {selectionData && (
              <SelectionMenu
                menuX={selectionData.menuX}
                menuY={selectionData.menuY}
                onHighlight={handleUnderlineAction}
                onNote={handleAddNoteAction}
                onCopy={handleCopyAction}
                onAskAi={onAskAi}
              />
            )}
            {pdfData?.file_url ? (
              <Document
                file={pdfData.file_url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <LoadingState variant="page" text="Caricamento PDF..." />
                }
                error={
                  <ErrorState
                    message="Impossibile caricare il PDF. Controlla il link."
                    onRetry={getPdfData}
                  />
                }
                className="flex flex-col items-center w-full"
              >
                {/* Renderizza tutte le pagine sequenzialmente */}
                {Array.from(new Array(numPages || 0), (el, index) => (
                  <div
                    key={`page_${index + 1}`}
                    id={`page-${index + 1}`}
                    className="shadow-xl bg-white mb-6 scroll-mt-6 relative"
                    style={{
                      // Forza una proporzione standard A4 iniziale per evitare collassi del DOM
                      // mentre il worker calcola il testo delle pagine successive
                      minWidth: `${600 * scale}px`,
                      minHeight: `${848 * scale}px`,
                    }}
                  >
                    <Page
                      renderAnnotationLayer={false}
                      renderTextLayer={true}
                      pageNumber={index + 1}
                      scale={scale}
                    />

                    {notesArray
                      .filter(
                        (nota) =>
                          nota.position && nota.position.page === index + 1,
                      )
                      .map((sotto) => {
                        const pos = sotto.position;
                        if (!pos || typeof pos.x === "undefined") return null;

                        return (
                          <UnderlinedElement
                            sotto={sotto}
                            pos={pos}
                            scale={scale}
                            scrollToNote={scrollToNoteInSidebar}
                          />
                        );
                      })}
                  </div>
                ))}
              </Document>
            ) : (
              <LoadingState
                variant="page"
                text="In attesa dei dati del PDF..."
              />
            )}
          </div>

          {/* Controlli di paginazione */}
          {numPages && (
            <div className="w-full px-4 py-3 bg-neutral-1 dark:bg-zinc-950 border-t border-neutral-4 dark:border-zinc-800 flex flex-row items-center justify-between shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)] z-10 transition-colors duration-300">
              {" "}
              <button
                disabled={pageNumber <= 1}
                onClick={() => scrollToPage(pageNumber - 1)}
                className="px-4 py-2 bg-neutral-3 dark:bg-zinc-800 hover:bg-neutral-4 dark:hover:bg-zinc-700 text-black dark:text-zinc-200 rounded-lg font-inter text-sm disabled:opacity-40 dark:disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Precedente
              </button>
              <span className="font-inter text-sm text-text-1 dark:text-zinc-300 flex items-center gap-2">
                {" "}
                Pagina
                <input
                  type="number"
                  value={pageNumber}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") scrollToPage(pageNumber);
                  }}
                  onBlur={() => scrollToPage(pageNumber)}
                  className="w-14 text-center border-2 border-neutral-4 dark:border-zinc-700 rounded-md font-bold text-black dark:text-zinc-100 bg-white dark:bg-zinc-900 py-1 focus:outline-none focus:border-accent dark:focus:border-purple-500 transition-colors"
                  min={1}
                  max={numPages}
                />
                di{" "}
                <span className="font-bold text-black dark:text-zinc-100">
                  {numPages}
                </span>{" "}
              </span>
              <button
                disabled={pageNumber >= numPages}
                onClick={() => scrollToPage(pageNumber + 1)}
                className="px-4 py-2 bg-neutral-3 dark:bg-zinc-800 hover:bg-neutral-4 dark:hover:bg-zinc-700 text-black dark:text-zinc-200 rounded-lg font-inter text-sm disabled:opacity-40 dark:disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Successiva
              </button>
            </div>
          )}
        </div>
        <AnimatePresence>
          {activeSidebar === "NOTES" && (
            <PdfPageNotesSidebar
              toggleNotesSidebar={toggleNotesSidebar}
              notesContainerRef={notesContainerRef}
              scrollToNoteInPdf={scrollToNoteInPdf}
            />
          )}
          {activeSidebar === "AI" && (
            <PdfPageAiSidebar
              onUpdateNote={onUpdateNote}
              onReject={onReject}
              toggleAiSidebar={toggleAiSidebar}
              messages={aiMessages}
              setMessages={setAiMessages}
              onSaveAsNote={onSaveAsNote}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PdfPage;
