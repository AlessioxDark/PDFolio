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
// Imposta il worker di react-pdf usando unpkg per evitare problemi con Vite
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfPage = () => {
  const { pdfId } = useParams();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  const [pdfData, setPdfData] = useState<any>({});
  const { notesArray, setNotesArray, fetchNotes } = useNotes();
  const [selectionData, setSelectionData] = useState<{
    menuX: number;
    menuY: number;
    text: string;
    textX: number;
    textY: number;
    textWidth: number;
    textHeight: number;
    pageNum: number;
  } | null>(null);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const scale = 1.2;
  const [isNotesSidebarOpen, setIsNotesSidebarOpen] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const notesContainerRef = useRef<HTMLDivElement>(null);

  const toggleNotesSidebar = () => {
    setIsNotesSidebarOpen(!isNotesSidebarOpen);
  };
  const getPdfData = async () => {
    if (!session) return; // Evita chiamate se la sessione non è pronta
    const { data, error } = await apiCalls.pdf.getPdfFile(
      session?.access_token,
      pdfId as string,
    );
    if (error) {
      console.error("Errore nel caricamento:", error);
      return;
    }
    if (data) {
      console.log("Dati ricevuti:", data);
      setPdfData(data);
    }
  };

  useEffect(() => {
    getPdfData();
    fetchNotes(pdfId as string);
  }, []);

  useEffect(() => {
    if (!numPages) return;

    const pageParam = searchParams.get("page");
    const noteParam = searchParams.get("note");

    // Caso 1: C'è una nota specifica da raggiungere (Priorità Max)
    if (noteParam && notesArray.length > 0) {
      const targetNote = notesArray.find((n) => n.note_id === noteParam);
      if (targetNote?.position) {
        const timer = setTimeout(() => {
          scrollToNoteInPdf(targetNote.position);
          scrollToNoteInSidebar(targetNote.position);
        }, 450); // Un leggero delay in più assicura che il layer di testo sia renderizzato nel DOM
        return () => clearTimeout(timer);
      }
    }

    // Caso 2: C'è solo il parametro della pagina
    if (pageParam) {
      const pageNum = parseInt(pageParam, 10);
      if (pageNum >= 1 && pageNum <= numPages) {
        const timer = setTimeout(() => {
          scrollToPage(pageNum);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [numPages, notesArray, searchParams]); // Dipendenze pulite e sincronizzate

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!numPages) return;
    const container = e.currentTarget;
    const targetLine = container.scrollTop + container.clientHeight / 3;

    let newPage: number | null = null;
    for (let i = 1; i <= numPages; i++) {
      const el = document.getElementById(`page-${i}`);
      if (el) {
        // offsetTop ci dice quanto è distante l'elemento dall'inizio del contenitore scrollabile
        const elTop = el.offsetTop;
        const elBottom = elTop + el.offsetHeight;

        if (targetLine >= elTop && targetLine <= elBottom) {
          newPage = i;
          break;
        }
      }
    }

    if (newPage !== null) {
      setPageNumber((prev) => (prev !== newPage ? newPage : prev));
    }
  };

  const scrollToPage = (pageNum: number) => {
    if (pageNum < 1 || pageNum > (numPages || 1)) return;
    setPageNumber(pageNum);
    const el = document.getElementById(`page-${pageNum}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setPageNumber(isNaN(val) ? 1 : val);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const container = scrollContainerRef.current;
    if (
      !selection ||
      selection.isCollapsed ||
      !selection.toString().trim() ||
      !container
    ) {
      setSelectionData(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const menuX =
      rect.left - containerRect.left + rect.width / 2 + container.scrollLeft;
    const menuY = rect.top - containerRect.top + container.scrollTop - 10;

    let node = selection.anchorNode;
    let pageElement = null;
    let selectedPageNum = pageNumber;

    if (node) {
      if (node.nodeType === 3) node = node.parentNode;
      const pageDiv = (node as Element).closest('[id^="page-"]');
      if (pageDiv) {
        pageElement = pageDiv;
        selectedPageNum = parseInt(pageDiv.id.replace("page-", ""), 10);
      }
    }

    let textX = 0,
      textY = 0,
      textWidth = 0,
      textHeight = 0;

    if (pageElement) {
      const pageRect = pageElement.getBoundingClientRect();
      textX = (rect.left - pageRect.left) / scale;
      textY = (rect.top - pageRect.top) / scale;
      textWidth = rect.width / scale;
      textHeight = rect.height / scale;
    } else {
      textX = (rect.left - containerRect.left + container.scrollLeft) / scale;
      textY = (rect.top - containerRect.top + container.scrollTop) / scale;
      textWidth = rect.width / scale;
      textHeight = rect.height / scale;
    }

    setSelectionData({
      menuX,
      menuY,
      text: selection.toString(),
      textX,
      textY,
      textWidth,
      textHeight,
      pageNum: selectedPageNum,
    });
  };

  const handleUnderlineAction = async () => {
    if (!selectionData) return;
    const highlight: any = {
      document_id: pdfId,
      type: "HIGHLIGHT",
      content: "",
      text: selectionData.text,
      position: {
        page: selectionData.pageNum,
        x: selectionData.textX,
        y: selectionData.textY,
        width: selectionData.textWidth,
        height: selectionData.textHeight,
      },
    };
    // Aggiungi subito all'array locale per reattività immediata
    setNotesArray((prev) => [...prev, highlight]);
    window.getSelection()?.removeAllRanges();
    setSelectionData(null);
    setIsNotesSidebarOpen(true);

    const { data: noteData, error } = await apiCalls.notes.SaveNoteToDB(
      session?.access_token,
      pdfId as string,
      highlight,
    );
    if (error) {
      console.log("err", error);
    } else if (noteData?.noteId) {
      // Aggiorna la nota appena inserita con il suo ID reale
      setNotesArray((prev) =>
        prev.map((n) =>
          n === highlight ? { ...n, note_id: noteData.noteId } : n,
        ),
      );
    }
  };

  const handleAddNoteAction = () => {
    if (!selectionData) return;
    const note = {
      document_id: pdfId,
      type: "NOTE",
      text: selectionData.text,
      content: "",
      position: {
        page: selectionData.pageNum,
        x: selectionData.textX,
        y: selectionData.textY,
        width: selectionData.textWidth,
        height: selectionData.textHeight,
      },
    };
    console.log(note);
    const newArray = [...notesArray, note];
    setNotesArray(newArray);
    window.getSelection()?.removeAllRanges();
    setSelectionData(null);
    setIsNotesSidebarOpen(true);
  };

  const handleCopyAction = async () => {
    if (!selectionData) return;
    try {
      await navigator.clipboard.writeText(selectionData.text);
    } catch (err) {
      console.error("Errore durante la copia:", err);
    }
    window.getSelection()?.removeAllRanges();
    setSelectionData(null);
  };

  const scrollToNoteInPdf = (notePosition: any) => {
    const el = document.getElementById(`page-${notePosition.page}`);
    if (el && scrollContainerRef.current) {
      const targetScrollTop = el.offsetTop + notePosition.y * scale - 40;
      scrollContainerRef.current.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });
      setPageNumber(notePosition.page);
    }
  };

  const scrollToNoteInSidebar = (notePos: any) => {
    setIsNotesSidebarOpen(true);
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

  return (
    <div className="w-full h-screen bg-neutral-3 flex flex-col overflow-hidden">
      <PdfPageHeader
        nome={pdfData?.nome}
        toggleNotesSidebar={toggleNotesSidebar}
        edited_at={pdfData?.edited_at}
        documentId={pdfId}
      />

      <div className="flex-1 w-full flex flex-row overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onMouseUp={handleTextSelection}
            className="flex-1 w-full overflow-auto bg-neutral-2 flex flex-col items-center py-6 relative"
          >
            {selectionData && (
              <SelectionMenu
                menuX={selectionData.menuX}
                menuY={selectionData.menuY}
                onHighlight={handleUnderlineAction}
                onNote={handleAddNoteAction}
                onCopy={handleCopyAction}
              />
            )}
            {pdfData?.file_url ? (
              <Document
                file={pdfData.file_url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="text-neutral-500 font-inter mt-10">
                    Caricamento del documento...
                  </div>
                }
                error={
                  <div className="text-red-500 font-inter mt-10">
                    Impossibile caricare il PDF. Controlla il link.
                  </div>
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
              <div className="text-neutral-500 font-inter mt-10">
                In attesa dei dati del PDF...
              </div>
            )}
          </div>

          {/* Controlli di paginazione */}
          {numPages && (
            <div className="w-full px-4 py-3 bg-neutral-1 border-t border-neutral-4 flex flex-row items-center justify-between shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-10">
              <button
                disabled={pageNumber <= 1}
                onClick={() => scrollToPage(pageNumber - 1)}
                className="px-4 py-2 bg-neutral-3 hover:bg-neutral-4 text-black rounded-lg font-inter text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Precedente
              </button>

              <span className="font-inter text-sm text-text-1 flex items-center gap-2">
                Pagina
                <input
                  type="number"
                  value={pageNumber}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") scrollToPage(pageNumber);
                  }}
                  onBlur={() => scrollToPage(pageNumber)}
                  className="w-14 text-center border-2 border-neutral-4 rounded-md font-bold text-black py-1 focus:outline-none focus:border-accent transition-colors"
                  min={1}
                  max={numPages}
                />
                di <span className="font-bold text-black">{numPages}</span>
              </span>

              <button
                disabled={pageNumber >= numPages}
                onClick={() => scrollToPage(pageNumber + 1)}
                className="px-4 py-2 bg-neutral-3 hover:bg-neutral-4 text-black rounded-lg font-inter text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Successiva
              </button>
            </div>
          )}
        </div>
        <AnimatePresence>
          {isNotesSidebarOpen && (
            <PdfPageNotesSidebar
              toggleNotesSidebar={toggleNotesSidebar}
              notesContainerRef={notesContainerRef}
              scrollToNoteInPdf={scrollToNoteInPdf}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PdfPage;
