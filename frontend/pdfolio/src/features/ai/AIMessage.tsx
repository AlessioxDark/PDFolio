import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotes } from "@/contexts/NotesContext";
import { apiCalls } from "@/services/api";
import { Loader, Loader2Icon } from "lucide-react";
import React, { useState } from "react";
import Markdown from "react-markdown";
import { useParams } from "react-router";
import rehypeRaw from "rehype-raw";
import { toast } from "sonner";

const AIMessage = ({
  m,
  onSaveAsNote,
  onUpdateNote,
  onReject,
}: {
  m: any;
  onSaveAsNote: (
    messageId: string,
    selectionData: any,
    content: string,
  ) => Promise<void>;
  onUpdateNote: (
    messageId: string,
    noteId: string,
    content: string,
  ) => Promise<void>;
  onReject: (messageId: string, selectionText: string) => Promise<void>;
}) => {
  const isUser = m.role === "user";
  const { pdfId: documentId } = useParams();
  const { notesArray } = useNotes();
  const { session } = useAuth();
  const { loading } = useApi();
  // Stato di loading locale per ogni messaggio (evita lo spinner su tutti i messaggi insieme)
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [isUpdatingLocal, setIsUpdatingLocal] = useState(false);
  const [isRejectingLocal, setIsRejectingLocal] = useState(false);
  const { executeApiCall } = useApi();
  const getParsedSelectionData = (raw: any) => {
    if (!raw) return null;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return { ...raw };
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
  const selectionDataToUse = getParsedSelectionData(m.selection_data);
  const isSaved = !!selectionDataToUse?.isSaved;
  const isModified = !!selectionDataToUse?.isModified;
  const isRejected = !!selectionDataToUse?.isRejected;

  const handleExportPdf = async (summaryText) => {
    executeApiCall(
      "export_summary",
      () => {
        return apiCalls.pdf.exportSummaryPdf(
          session?.access_token,
          documentId,
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
          link.setAttribute("download", `Riassunto_${documentId}.pdf`);

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
    <div
      key={m.message_id}
      className={`max-w-[85%] flex flex-col rounded-2xl px-4 py-3 border font-inter text-sm leading-relaxed transition-colors duration-200 ${
        isUser
          ? "ml-auto bg-black border-black text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-950 shadow-sm"
          : "mr-auto bg-white border-neutral-3 text-black dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 shadow-sm"
      }`}
    >
      <div
        className={`prose prose-sm max-w-none ${
          isUser
            ? "text-white dark:text-zinc-950"
            : "text-neutral-800 dark:text-zinc-200"
        } dark:prose-invert`}
      >
        <Markdown
          rehypePlugins={[rehypeRaw]}
          components={{
            strong: ({ ...props }) => (
              <strong
                className={
                  isUser
                    ? "text-white dark:text-zinc-950 font-bold"
                    : "text-black dark:text-white font-bold"
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
                <div className="my-3 p-4 border border-purple-200 dark:border-purple-900/60 bg-light-accent dark:bg-purple-950/20 rounded-xl flex flex-col gap-3 shadow-sm text-left font-inter transition-colors">
                  {/* Titolo della Nuova Nota */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-accent dark:text-purple-400 uppercase tracking-wide">
                      Titolo della nota
                    </span>
                    <div className="text-neutral-800 dark:text-zinc-200 font-bold text-sm bg-white/60 dark:bg-zinc-950/40 border border-emerald-100/50 dark:border-emerald-950/30 rounded-lg px-2.5 py-1.5 shadow-sm">
                      {selectionDataToUse?.text}
                    </div>
                  </div>

                  {/* Contenuto Proposto dall'AI */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-accent dark:text-purple-400 uppercase tracking-wide">
                      Contenuto generato
                    </span>
                    <div className="text-neutral-800 dark:text-zinc-300 text-xs bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 p-3 rounded-lg shadow-inner leading-relaxed">
                      <Markdown
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          p: ({ ...props }) => (
                            <p
                              className="my-0 leading-relaxed inline dark:text-zinc-300"
                              {...props}
                            />
                          ),
                          ul: ({ ...props }) => (
                            <ul
                              className="list-disc pl-4 my-1 dark:text-zinc-300"
                              {...props}
                            />
                          ),
                          ol: ({ ...props }) => (
                            <ol
                              className="list-decimal pl-4 my-1 dark:text-zinc-300"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {extractText(children)}
                      </Markdown>
                    </div>
                  </div>

                  {/* Azioni del blocco */}
                  <div className="flex gap-2 justify-end mt-1 font-inter">
                    {isRejected ? (
                      <span className="text-xs text-neutral-400 dark:text-zinc-500 italic py-2">
                        Suggerimento scartato
                      </span>
                    ) : isSaved ? (
                      <span className="text-xs text-accent dark:text-purple-400 font-semibold py-2">
                        Nota salvata
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={async () => {
                            if (selectionDataToUse && !isRejectingLocal) {
                              setIsRejectingLocal(true);
                              try {
                                await onReject(
                                  m.message_id,
                                  selectionDataToUse.text,
                                );
                              } finally {
                                setIsRejectingLocal(false);
                              }
                            }
                          }}
                          disabled={
                            isSavingLocal || isRejectingLocal || isRejected
                          }
                          className="px-3 py-2 text-xs font-medium text-neutral-500 dark:text-zinc-400 hover:text-neutral-700 dark:hover:text-zinc-200 bg-neutral-2 dark:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                        >
                          {isRejectingLocal ? "Scarto..." : "Scarta"}
                        </button>
                        <button
                          onClick={async () => {
                            if (
                              selectionDataToUse &&
                              !isSaved &&
                              !isSavingLocal
                            ) {
                              setIsSavingLocal(true);
                              try {
                                const contentText = extractText(children);
                                await onSaveAsNote(
                                  m.message_id,
                                  selectionDataToUse,
                                  contentText,
                                );
                              } finally {
                                setIsSavingLocal(false);
                              }
                            }
                          }}
                          disabled={
                            isSavingLocal || isRejectingLocal || isRejected
                          }
                          className="bg-accent hover:bg-accent/80 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-semibold text-xs py-2 px-4 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {isSavingLocal ? (
                            <>
                              <Loader className="w-3.5 h-3.5 animate-spin" />
                              Salvataggio...
                            </>
                          ) : (
                            "Aggiungi alle note"
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            },

            /* 📝 CUSTOM COMPONENT: MODIFICA / REVISIONE NOTA CORRENTE */
            "modifica-nota": ({ node, children, ...props }: any) => {
              const notaOriginale = notesArray.find(
                (note) => note.note_id === props.note_id,
              );
              return (
                <div className="my-3 p-4 border border-purple-200 dark:border-purple-900/60 bg-light-accent dark:bg-purple-950/20 rounded-xl flex flex-col gap-3 shadow-sm text-left font-inter transition-colors">
                  {/* Titolo della Nota */}
                  <div className="text-neutral-800 dark:text-zinc-200 font-bold text-sm flex items-center gap-1.5">
                    <span>{notaOriginale?.text}</span>
                  </div>

                  {/* Vecchio Contenuto nel DB */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-accent dark:text-purple-400 uppercase tracking-wide">
                      Testo attuale
                    </span>
                    <div className="text-neutral-500 dark:text-zinc-400 text-xs bg-neutral-100/70 dark:bg-zinc-950/40 border border-neutral-200 dark:border-zinc-800 rounded-lg p-2.5 line-through italic max-h-24 overflow-y-auto">
                      {notaOriginale?.content ||
                        notaOriginale?.text ||
                        "Nessun contenuto precedente."}
                    </div>
                  </div>

                  {/* Nuova Proposta di Revisione dell'AI */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-violet-500 dark:text-violet-400 uppercase tracking-wide">
                      Nuova proposta di revisione
                    </span>
                    <div className="text-neutral-800 dark:text-zinc-300 text-xs bg-white dark:bg-zinc-950 border border-violet-100 dark:border-zinc-800 p-3 rounded-lg shadow-inner leading-relaxed">
                      <Markdown
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          p: ({ ...props }) => (
                            <p
                              className="my-0 leading-relaxed inline dark:text-zinc-300"
                              {...props}
                            />
                          ),
                          ul: ({ ...props }) => (
                            <ul
                              className="list-disc pl-4 my-1 dark:text-zinc-300"
                              {...props}
                            />
                          ),
                          ol: ({ ...props }) => (
                            <ol
                              className="list-decimal pl-4 my-1 dark:text-zinc-300"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {extractText(children)}
                      </Markdown>
                    </div>
                  </div>

                  {/* Pulsanti di Controllo [RIFIUTA / ACCETTA] */}
                  <div className="flex gap-2 justify-end mt-1 font-inter">
                    {isRejected ? (
                      <span className="text-xs text-neutral-400 dark:text-zinc-500 italic py-2">
                        Proposta rifiutata
                      </span>
                    ) : isModified ? (
                      <span className="text-xs text-accent dark:text-purple-400 font-semibold py-2">
                        Modifica applicata
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={async () => {
                            if (notaOriginale && !isRejectingLocal) {
                              setIsRejectingLocal(true);
                              try {
                                await onReject(
                                  m.message_id,
                                  notaOriginale.text,
                                );
                              } finally {
                                setIsRejectingLocal(false);
                              }
                            }
                          }}
                          disabled={
                            isUpdatingLocal || isRejectingLocal || isRejected
                          }
                          className="px-3 py-2 text-xs font-medium text-neutral-500 dark:text-zinc-400 hover:text-neutral-700 dark:hover:text-zinc-200 bg-neutral-2 dark:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                        >
                          {isRejectingLocal ? "Rifiuto..." : "Rifiuta"}
                        </button>
                        <button
                          onClick={async () => {
                            if (notaOriginale && !isUpdatingLocal) {
                              setIsUpdatingLocal(true);
                              try {
                                const contentText = extractText(children);
                                await onUpdateNote(
                                  m.message_id,
                                  props.note_id,
                                  contentText,
                                );
                              } finally {
                                setIsUpdatingLocal(false);
                              }
                            }
                          }}
                          disabled={
                            isUpdatingLocal || isRejectingLocal || isRejected
                          }
                          className="bg-accent hover:bg-accent/80 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-semibold text-xs py-2 px-4 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {isUpdatingLocal ? (
                            <>
                              <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                              Salvataggio...
                            </>
                          ) : (
                            "Applica Modifica"
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            },

            /* 📊 CUSTOM COMPONENT: EXPORT RIASSUNTO */
            "export-summary": ({ node, children, ...props }: any) => {
              return (
                <div className="p-4 bg-neutral-2 dark:bg-zinc-950 border border-neutral-3 dark:border-zinc-800 rounded-xl my-2">
                  <h1 className="text-base font-bold text-neutral-900 dark:text-zinc-100 mb-2">
                    Riassunto del Documento
                  </h1>
                  <button
                    className="text-white bg-accent hover:bg-accent/90 dark:bg-purple-600 dark:hover:bg-purple-700 px-4 py-2 rounded-xl font-medium text-xs transition-colors cursor-pointer"
                    onClick={() => handleExportPdf(extractText(children))}
                  >
                    {loading?.export_summary
                      ? "Esportando..."
                      : " Esporta come PDF"}{" "}
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
