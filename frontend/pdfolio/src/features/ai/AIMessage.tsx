import { useAuth } from "@/contexts/AuthContext";
import { useNotes } from "@/contexts/NotesContext";
import { apiCalls } from "@/services/api";
import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { useParams } from "react-router";
import rehypeRaw from "rehype-raw";

const AIMessage = ({
  m,
  onSaveAsNote,
  onUpdateNote,
  onReject,
}: {
  m: any;
  onSaveAsNote: (selectionData: any, content: string) => Promise<void>;
  onUpdateNote: (noteId: string, content: string) => Promise<void>;
  onReject: (selectionText: string) => Promise<void>;
}) => {
  const isUser = m.role === "user";
  const { documentId } = useParams();
  const { notesArray } = useNotes();
  const { session } = useAuth();
  const getParsedSelectionData = (msg: any) => {
    if (!msg || !msg.selection_data) return null;
    let data = msg.selection_data;
    if (typeof data === "string") {
      try {
        console.log("è json");
        data = JSON.parse(data);
      } catch (e) {
        console.error("Errore JSON.parse selection_data:", e);
        return null;
      }
    }
    return data;
  };
  const extractText = (children: any): string => {
    if (typeof children === "string") return children;
    if (typeof children === "number") return String(children);
    if (Array.isArray(children)) return children.map(extractText).join("");
    if (children && children.props && children.props.children) {
      return extractText(children.props.children);
    }
    return "";
  };
  const selectionDataToUse = getParsedSelectionData(m);
  const [isSaved, setIsSaved] = useState<boolean>(
    !!selectionDataToUse?.isSaved,
  );
  const [isModified, setIsModified] = useState<boolean>(
    !!selectionDataToUse?.isModified,
  );
  const [isRejected, setIsRejected] = useState<boolean>(
    !!selectionDataToUse?.isRejected,
  );

  // Resincronizza gli stati quando la prop m.selection_data cambia dall'esterno
  useEffect(() => {
    const sd = getParsedSelectionData(m);
    setIsSaved(!!sd?.isSaved);
    setIsModified(!!sd?.isModified);
    setIsRejected(!!sd?.isRejected);
  }, [m.selection_data]);

  const handleExportPdf = async (summaryText) => {
    const { data, error } = await apiCalls.pdf.exportSummaryPdf(
      session?.access_token,
      documentId,
      summaryText,
    );
    if (error) {
      console.error("Errore esportazione PDF:", error);
      return;
    }
    const downloadUrl = window.URL.createObjectURL(data);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `Riassunto_${documentId}.pdf`);

    document.body.appendChild(link);
    link.click();

    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div
      key={m.message_id}
      className={`max-w-[85%] flex flex-col rounded-2xl px-4 py-3 border font-inter text-sm leading-relaxed ${
        isUser
          ? "ml-auto bg-black border-black text-white shadow-sm"
          : "mr-auto bg-white border-neutral-3 text-black shadow-sm"
      }`}
    >
      <div
        className={`prose prose-sm max-w-none ${isUser ? "text-white" : "text-neutral-800"}`}
      >
        <Markdown
          rehypePlugins={[rehypeRaw]}
          components={{
            strong: ({ ...props }) => (
              <strong
                className={
                  isUser ? "text-white font-bold" : "text-black font-bold"
                }
                {...props}
              />
            ),
            ul: ({ ...props }) => (
              <ul className="list-disc pl-4 my-1.5" {...props} />
            ),
            ol: ({ ...props }) => (
              <ol className="list-decimal pl-4 my-1.5" {...props} />
            ),
            li: ({ ...props }) => <li className="my-0.5" {...props} />,
            p: ({ ...props }) => (
              <p className="my-0 leading-relaxed" {...props} />
            ),
            "crea-nota": ({ node, children, ...props }: any) => {
              return (
                <div className="my-3 p-4 border border-purple-200 bg-light-accent rounded-xl flex flex-col gap-3 shadow-sm text-left font-inter">
                  {/* 🏷️ TITOLO DELLA NUOVA NOTA */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-accent uppercase tracking-wide">
                      Titolo della nota
                    </span>
                    <div className="text-neutral-800 font-bold text-sm bg-white/60 border border-emerald-100/50 rounded-lg px-2.5 py-1.5 shadow-sm">
                      {selectionDataToUse?.text}
                    </div>
                  </div>

                  {/* 📖 CONTENUTO PROPOSTO DALL'AI */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-accent uppercase tracking-wide">
                      Contenuto generato
                    </span>
                    <div className="text-neutral-800 text-xs bg-white border border-gray-100 p-3 rounded-lg shadow-inner leading-relaxed">
                      <Markdown
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          p: ({ ...props }) => (
                            <p
                              className="my-0 leading-relaxed inline"
                              {...props}
                            />
                          ),
                          ul: ({ ...props }) => (
                            <ul className="list-disc pl-4 my-1" {...props} />
                          ),
                          ol: ({ ...props }) => (
                            <ol className="list-decimal pl-4 my-1" {...props} />
                          ),
                        }}
                      >
                        {extractText(children)}
                      </Markdown>
                    </div>
                  </div>

                  {/* AZIONI DELLA CARD */}
                  <div className="flex gap-2 justify-end mt-1 font-inter">
                    {isRejected ? (
                      <span className="text-xs text-neutral-400 italic py-2">
                        Suggerimento scartato
                      </span>
                    ) : isSaved ? (
                      <span className="text-xs text-accent font-semibold py-2">
                        Nota salvata
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={async () => {
                            if (selectionDataToUse) {
                              await onReject(selectionDataToUse.text);
                              setIsRejected(true);
                            }
                          }}
                          className="px-3 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-700 bg-neutral-2 rounded-lg transition-all cursor-pointer"
                        >
                          Scarta
                        </button>

                        <button
                          onClick={async () => {
                            if (selectionDataToUse && !isSaved) {
                              const contentText = extractText(children);
                              await onSaveAsNote(
                                selectionDataToUse,
                                contentText,
                              );
                              setIsSaved(true);
                            }
                          }}
                          className="bg-accent hover:bg-accent/80 text-white font-semibold text-xs py-2 px-4 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Aggiungi alle note
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            },

            "modifica-nota": ({ node, children, ...props }: any) => {
              const notaOriginale = notesArray.find(
                (note) => note.note_id === props.note_id,
              );
              return (
                <div className="my-3 p-4 border border-purple-200 bg-light-accent rounded-xl flex flex-col gap-3 shadow-sm text-left font-inter">
                  {/* 📌 TITOLO DELLA NOTA */}
                  <div className="text-neutral-800 font-bold text-sm flex items-center gap-1.5">
                    <span>{notaOriginale?.text}</span>
                  </div>
                  {/* 1. VECCHIO TESTO (Nota Corrente nel DB) */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-accent uppercase tracking-wide">
                      Testo attuale
                    </span>
                    <div className="text-neutral-500 text-xs bg-neutral-100/70 border border-neutral-200 rounded-lg p-2.5 line-through italic max-h-24 overflow-y-auto">
                      {notaOriginale?.content ||
                        notaOriginale?.text ||
                        "Nessun contenuto precedente."}
                    </div>
                  </div>
                  {/* 2. NUOVO TESTO PROPOSTO (Dall'AI) */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-violet-500 uppercase tracking-wide">
                      Nuova proposta di revisione
                    </span>
                    <div className="text-neutral-800 text-xs bg-white border border-violet-100 p-3 rounded-lg shadow-inner leading-relaxed">
                      <Markdown
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          p: ({ ...props }) => (
                            <p
                              className="my-0 leading-relaxed inline"
                              {...props}
                            />
                          ),
                          ul: ({ ...props }) => (
                            <ul className="list-disc pl-4 my-1" {...props} />
                          ),
                          ol: ({ ...props }) => (
                            <ol className="list-decimal pl-4 my-1" {...props} />
                          ),
                        }}
                      >
                        {extractText(children)}
                      </Markdown>
                    </div>
                  </div>
                  {/* CONTROLLI DI AZIONE [RIFIUTA / ACCETTA] */}
                  <div className="flex gap-2 justify-end mt-1 font-inter">
                    {isRejected ? (
                      <span className="text-xs text-neutral-400 italic py-2">
                        Proposta rifiutata
                      </span>
                    ) : isModified ? (
                      <span className="text-xs text-accent font-semibold py-2">
                        Modifica applicata
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={async () => {
                            if (notaOriginale) {
                              await onReject(notaOriginale.text);
                              setIsRejected(true);
                            }
                          }}
                          className="px-3 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-700 bg-neutral-2 rounded-lg transition-all cursor-pointer"
                        >
                          Rifiuta
                        </button>

                        <button
                          onClick={async () => {
                            if (notaOriginale && !isModified) {
                              const contentText = extractText(children);
                              await onUpdateNote(props.note_id, contentText);
                              setIsModified(true);
                            }
                          }}
                          className="bg-accent hover:bg-accent/80 text-white font-semibold text-xs py-2 px-4 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Applica Modifica
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            },
            "export-summary": ({ node, children, ...props }: any) => {
              return (
                <div>
                  <h1>Riassunto del Documento</h1>

                  <button
                    className="text-white bg-accent px-3 py-2 rounded-xl cursor-pointer"
                    onClick={() => handleExportPdf(extractText(children))}
                  >
                    Esporta come PDF
                  </button>
                </div>
              );
            },
          }}
        >
          {m.content}
        </Markdown>
      </div>
    </div>
  );
};

export default AIMessage;
