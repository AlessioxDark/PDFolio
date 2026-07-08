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
import { toast } from "sonner";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfPage = () => {
  const { pdfId } = useParams();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  const [pdfData, setPdfData] = useState<any>({});
  const [activeSidebar, setActiveSidebar] = useState<"" | "AI" | "NOTES">("");
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const notesContainerRef = useRef<HTMLDivElement>(null);
  const [aiMessages, setAiMessages] = useState([]);
  const prevNotesRef = useRef(notesArray);

  const { executeApiCall, loading, error: apiError } = useApi();
  const toggleNotesSidebar = () => {
    setActiveSidebar((prev) => (prev === "NOTES" ? "" : "NOTES"));
  };
  const toggleAiSidebar = () => {
    setActiveSidebar((prev) => (prev === "AI" ? "" : "AI"));
  };

  const getPdfData = async () => {
    if (!session) return;

    await executeApiCall(
      "get_pdf",
      () => {
        return apiCalls.pdf.getPdfFile(session, pdfId as string);
      },
      {
        onSuccess: (data) => {
          console.log("Dati ricevuti:", data);
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

  const handleUnderlineAction = async (color: string) => {
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
      color,
    };
    const prevNotes = notesArray;
    // Aggiungi subito all'array locale per reattività immediata
    setNotesArray((prev) => [...prev, highlight]);
    window.getSelection()?.removeAllRanges();
    setSelectionData(null);
    setActiveSidebar("NOTES");

    await executeApiCall(
      "save_note",
      () => {
        return apiCalls.notes.SaveNoteToDB(
          session?.access_token,
          pdfId as string,
          highlight,
        );
      },
      {
        onSuccess: (noteData) => {
          setNotesArray((prev) =>
            prev.map((n) =>
              n === highlight ? { ...n, note_id: noteData.noteId } : n,
            ),
          );
        },
        onError: (error) => {
          toast.error(error?.message);
          setNotesArray(prevNotes);
          window.getSelection()?.removeAllRanges();
          setActiveSidebar("");
        },
      },
    );
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
    const newArray = [...notesArray, note];
    setNotesArray(newArray);
    window.getSelection()?.removeAllRanges();
    setSelectionData(null);
    setActiveSidebar("NOTES");
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

  const onAskAi = async (type) => {
    if (!selectionData) return;
    const currentSelection = selectionData;
    setActiveSidebar("AI");
    let promptMessage = "";
    const staticSelectionData = {
      document_id: pdfId,
      text: selectionData.text,
      position: {
        page: selectionData.pageNum,
        x: selectionData.textX,
        y: selectionData.textY,
        width: selectionData.textWidth,
        height: selectionData.textHeight,
      },
      isSaved: false,
      isRejected: false,
      isModified: false,
    };
    if (type === "explain") {
      promptMessage = "Spiegami questo passaggio del documento";
    }
    if (type === "simplify") {
      promptMessage = "Semplifica questo passaggio del documento";
    }
    if (type === "example") {
      promptMessage = "Fammi un esempio di questo passaggio del documento";
    }
    const tempId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(7);
    const message = {
      role: "user",
      message_id: tempId,
      content: promptMessage + ":\n" + `${currentSelection.text}`,
      selection_data: staticSelectionData,
    };
    console.log("sel data", message.selection_data);
    setAiMessages((prevMessages) => [...prevMessages, message]);
    await executeApiCall(
      "ask_ai",
      () => {
        return apiCalls.ai.askAi(
          session?.access_token,
          pdfId,
          message.content,
          {
            history: null,
            isExplaining: type === "explain",
            isSimplify: type === "simplify",
            isExample: type === "example",
            selection_data: staticSelectionData,
            notes: notesArray,
          },
        );
      },
      {
        onSuccess: (data) => {
          console.log("aidata", data);
          const aiResponseId =
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : Math.random().toString(36).substring(7);
          setAiMessages((prev) => {
            return [
              ...prev,
              {
                role: "assistant",
                message_id: aiResponseId,
                content: data.response,
                selection_data: message.selection_data,
              },
            ];
          });
        },
        onError: (error) => {
          toast.error(error?.message);
        },
      },
    );

    window.getSelection()?.removeAllRanges();
    setSelectionData(null);
  };

  const parseSelectionData = (raw: any) => {
    if (!raw) return null;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return { ...raw }; // clona, non muta il riferimento originale
  };

  const serializeSelectionData = (original: any, updated: any) => {
    return typeof original === "string" ? JSON.stringify(updated) : updated;
  };

  const onSaveAsNote = async (
    messageId: string,
    selection_data: any,
    content: string,
  ) => {
    if (!selection_data) return;
    const rawPage = selection_data.pageNum || selection_data.position?.page;
    const rawX =
      selection_data.textX !== undefined
        ? selection_data.textX
        : selection_data.position?.x;
    const rawY =
      selection_data.textY !== undefined
        ? selection_data.textY
        : selection_data.position?.y;
    const rawWidth =
      selection_data.textWidth !== undefined
        ? selection_data.textWidth
        : selection_data.position?.width;
    const rawHeight =
      selection_data.textHeight !== undefined
        ? selection_data.textHeight
        : selection_data.position?.height;

    const page = Number(rawPage || 0);
    const x = parseFloat(rawX);
    const y = parseFloat(rawY);
    const width = parseFloat(rawWidth);
    const height = parseFloat(rawHeight);

    const tempId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(7);

    const note = {
      note_id: tempId,
      document_id: pdfId,
      type: "NOTE",
      text: selection_data.text,
      content: content,
      position: { page, x, y, width, height },
    };

    const previousNotes = [...notesArray];
    setNotesArray([...notesArray, note]);
    window.getSelection()?.removeAllRanges();
    setSelectionData(null);

    // Aggiorna SOLO il messaggio con questo id, senza mutare nulla
    const updateMessageSavedStatus = (saved: boolean) => {
      setAiMessages((prev) =>
        prev.map((msg) => {
          if (msg.message_id !== messageId) return msg;
          const parsedSd = parseSelectionData(msg.selection_data);
          if (!parsedSd) return msg;
          const updatedSd = { ...parsedSd, isSaved: saved };
          return {
            ...msg,
            selection_data: serializeSelectionData(
              msg.selection_data,
              updatedSd,
            ),
          };
        }),
      );
    };

    try {
      await executeApiCall(
        "save_note",
        () => apiCalls.notes.SaveNoteToDB(session?.access_token, pdfId, note),
        {
          onSuccess: (noteData) => {
            toast.success("Nota salvata e collegata alla chat!");
            setNotesArray((prev) =>
              prev.map((n) =>
                n === note ? { ...n, note_id: noteData?.note_id || tempId } : n,
              ),
            );
          },
          onError: (error) => {
            setNotesArray(previousNotes);
            toast.error(error?.message);
          },
        },
      );

      await executeApiCall(
        "mark_messages_as_saved",
        () =>
          apiCalls.ai.markMessagesAsSaved(
            session?.access_token,
            pdfId,
            selection_data.text,
          ),
        {
          onSuccess: () => updateMessageSavedStatus(true),
          onError: (err) =>
            console.error("Errore sincronizzazione messaggi:", err),
        },
      );
    } catch (err) {
      console.error("Errore globale durante il salvataggio:", err);
      setNotesArray(previousNotes);
      updateMessageSavedStatus(false);
      toast.error(err?.message || "Impossibile salvare la nota nel database.", {
        action: {
          label: "Riprova",
          onClick: () => onSaveAsNote(messageId, selection_data, content),
        },
      });
    }
  };

  const onUpdateNote = async (
    messageId: string,
    noteId: string,
    newContent: string,
  ) => {
    const targetNote = notesArray.find((n) => n.note_id === noteId);
    const selectionText = targetNote?.text;
    const previousNotes = [...notesArray];
    setNotesArray(
      notesArray.map((n) =>
        n.note_id === noteId ? { ...n, content: newContent } : n,
      ),
    );

    const applyMessageState = (isSaved: boolean, isModified: boolean) => {
      setAiMessages((prev) =>
        prev.map((msg) => {
          const matchById = msg.message_id && msg.message_id === messageId;
          const parsedSd = parseSelectionData(msg.selection_data);
          const matchByText =
            selectionText && parsedSd && parsedSd.text === selectionText;

          if (!matchById && !matchByText) return msg;

          const baseSd = parsedSd || {
            text: selectionText,
            isSaved: false,
            isModified: false,
            isRejected: false,
          };
          const updatedSd = { ...baseSd, isSaved, isModified };

          return {
            ...msg,
            selection_data: serializeSelectionData(
              msg.selection_data,
              updatedSd,
            ),
          };
        }),
      );
    };
    try {
      await executeApiCall(
        "update_note",
        () =>
          apiCalls.notes.UpdateNoteInDB(
            session?.access_token,
            pdfId,
            noteId,
            newContent,
          ),
        {
          onSuccess: () => {},
          onError: (err) => {
            throw err;
          },
        },
      );

      if (selectionText) {
        await executeApiCall(
          "mark_message_as_modified",
          () =>
            apiCalls.ai.markMessageAsModified(
              session?.access_token,
              pdfId,
              selectionText,
            ),
          {
            onSuccess: () => {
              applyMessageState(true, true);
              toast.success("Nota modificata e sincronizzata!");
            },
            onError: (err) => {
              throw err;
            },
          },
        );
      } else {
        applyMessageState(true, true);
      }
    } catch (error) {
      console.error(error);
      setNotesArray(previousNotes);
      applyMessageState(true, false);
      toast.error(error?.message || "Impossibile salvare la nota. Riprova.", {
        action: {
          label: "Riprova",
          onClick: () => onUpdateNote(messageId, noteId, newContent),
        },
      });
    }
  };
  const onReject = async (messageId: string, selectionText: string) => {
    await executeApiCall(
      "mark_message_as_rejected",
      () =>
        apiCalls.ai.markMessageAsRejected(
          session?.access_token,
          pdfId,
          selectionText,
        ),
      {
        onSuccess: () => {
          setAiMessages((prev) =>
            prev.map((msg) => {
              // Match per message_id O per testo della selezione
              const matchById = msg.message_id && msg.message_id === messageId;
              const parsedSd = parseSelectionData(msg.selection_data);
              const matchByText = parsedSd && parsedSd.text === selectionText;

              if (!matchById && !matchByText) return msg;
              const baseSd = parsedSd || {
                text: selectionText,
                isSaved: false,
                isModified: false,
                isRejected: false,
              };
              const updatedSd = { ...baseSd, isRejected: true };

              return {
                ...msg,
                selection_data: serializeSelectionData(
                  msg.selection_data,
                  updatedSd,
                ),
              };
            }),
          );
          toast.success("Suggerimento scartato con successo!");
        },
        onError: (err) => {
          toast.error(err?.message || "Impossibile scartare il suggerimento.", {
            action: {
              label: "Riprova",
              onClick: () => onReject(messageId, selectionText),
            },
          });
        },
      },
    );
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
