import React, { useRef, useState } from "react";
import CheckIcon from "../icons/CheckIcon";
import { apiCalls } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import TrashIcon from "../icons/TrashIcon";
import {
  Pencil,
  ChevronDown,
  ChevronUp,
  LucideArrowRight,
  MoveRight,
} from "lucide-react"; // Importati i chevron per l'UI
import { AlertDialogComponent } from "./AlertDialogComponent";
import { useNotes } from "@/contexts/NotesContext";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useApi } from "@/contexts/ApiContext";
import { toast } from "sonner";

const NotesSidebarElement = ({
  note,
  scrollToNoteInPdf,
  setActiveNote,
}: {
  note: any;
  scrollToNoteInPdf: (notePosition: any) => void;
  setActiveNote: (note: any) => void;
}) => {
  const { deleteNote } = useNotes();
  const chatInputRef = useRef<HTMLDivElement>(null);
  const { session } = useAuth();
  const [noteInput, setNoteInput] = useState(note.content || "");
  const [savedContent, setSavedContent] = useState(note.content || "");
  const [isSent, setIsSent] = useState(note.content && note.content.length > 0);
  const { executeApiCall } = useApi();
  const [isExpanded, setIsExpanded] = useState(false);
  const { setNotesArray } = useNotes();
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setNoteInput(e.currentTarget.textContent || "");
  };
  const isLongText = note.content && note.content.length > 200;
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      const isModification = !!note.note_id;
      if (isModification) {
        e.preventDefault();
        e.stopPropagation();
        setNoteInput(savedContent);
        if (chatInputRef.current) {
          chatInputRef.current.textContent = savedContent;
        }
        setIsSent(true);
      }
    }
  };
  return (
    <div
      className="w-full rounded-xl bg-neutral-2 dark:bg-zinc-900 px-4 py-3 border-l-[5px] cursor-pointer transition-all group flex flex-col gap-2 shadow-[0_12px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
      style={{
        borderLeftColor: note.type === "HIGHLIGHT" ? note.color : "#9333ea",
      }}
      onClick={() => {
        scrollToNoteInPdf(note.position);
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center w-full justify-between">
          <div className="flex flex-row items-center gap-2">
            <div
              className="aspect-square h-4 rounded-md"
              style={{
                backgroundColor: note.type === "NOTE" ? "#9333ea" : note.color,
              }}
            />
            <span className="font-semibold text-[10px] font-inter text-text-1 dark:text-zinc-400">
              {" "}
              Pagina {note.position.page}
            </span>
          </div>
          <MoveRight
            size={24}
            className="text-text-1 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setActiveNote(note);
            }}
          />
        </div>

        <div className="px-2 flex flex-col gap-2">
          <div className="leading-relaxed">
            <span
              className={`font-medium break-words rounded-[2px] ${
                isExpanded ? "" : "line-clamp-5"
              } ${
                note.type === "HIGHLIGHT"
                  ? "text-black dark:text-zinc-200 text-sm"
                  : "text-black dark:text-zinc-100 text-xl font-bold"
              }`}
              style={{
                backgroundColor:
                  note.type === "HIGHLIGHT"
                    ? note.color
                    : "rgba(147, 51, 234, 0.4)",
                padding: "0px 2px",
                WebkitBoxDecorationBreak: "clone",
                boxDecorationBreak: "clone",
                lineHeight: "1.5",
              }}
            >
              {note.text}
            </span>
          </div>

          {note.type === "NOTE" && !isSent ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col gap-2 mt-2 w-full bg-white/70 dark:bg-zinc-950/60 border border-neutral-4 dark:border-zinc-800 rounded-xl p-2 focus-within:ring-1 focus-within:ring-neutral-400 dark:focus-within:ring-zinc-600 transition-all duration-200"
            >
              <div
                contentEditable={true}
                suppressContentEditableWarning={true}
                onKeyDown={handleKeyDown}
                ref={chatInputRef}
                className="flex-1 min-h-[24px] max-h-32 outline-none text-sm text-text-1 dark:text-zinc-200 font-inter overflow-y-auto px-1 py-0.5 empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-4 dark:empty:before:text-zinc-600 empty:before:pointer-events-none prose prose-sm dark:prose-invert"
                onInput={handleInput}
                data-placeholder="Inserisci testo nota (supporta Markdown...)"
              >
                {savedContent}
              </div>

              <div className="flex justify-end items-center w-full pt-1 border-t border-neutral-100 dark:border-zinc-800">
                {" "}
                <button
                  type="button"
                  aria-label="Invia messaggio"
                  onClick={async () => {
                    if (noteInput.trim().length > 0) {
                      const isModification = !!note.note_id;
                      if (isModification) {
                        setSavedContent(noteInput);
                        executeApiCall(
                          "update_note",
                          () => {
                            return apiCalls.notes.UpdateNoteInDB(
                              session?.access_token,
                              note.document_id,
                              note.note_id,
                              noteInput,
                            );
                          },
                          {
                            onError: (error) => {
                              toast.error(error?.message);
                              setIsSent(false);
                            },
                            onSuccess: () => {
                              setIsSent(true);
                            },
                          },
                        );
                      } else {
                        executeApiCall(
                          "save_note",
                          () => {
                            return apiCalls.notes.SaveNoteToDB(
                              session?.access_token,
                              note.document_id,
                              {
                                ...note,
                                content: noteInput,
                              },
                            );
                          },
                          {
                            onError: (error) => {
                              toast.error(error?.message);
                              setIsSent(false);
                            },
                            onSuccess: (data) => {
                              const realNoteId = data?.noteId || data?.note_id;
                              setNotesArray((prev: any[]) =>
                                prev.map((n) =>
                                  n.text === note.text && !n.note_id
                                    ? {
                                        ...n,
                                        note_id: realNoteId,
                                        content: noteInput,
                                      }
                                    : n,
                                ),
                              );
                              setSavedContent(noteInput); // Confermi il testo a schermo
                              setIsSent(true); // Chiudi il box di input
                            },
                          },
                        );
                      }
                    }
                  }}
                >
                  <CheckIcon
                    iconColor="#ffffff"
                    size={16}
                    className={`${
                      noteInput.trim().length > 0 ? "bg-accent" : ""
                    } flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-150 p-1`}
                    bgColor="#9333ea"
                  />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 w-full text-left">
              <div
                className={`prose prose-sm dark:prose-invert max-w-none text-text-1 dark:text-zinc-300 text-sm italic font-inter break-words ${
                  isExpanded ? "" : "line-clamp-4 overflow-hidden"
                }`}
              >
                <Markdown
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    // Customizziamo i paragrafi per non lasciare margini giganti dentro le note
                    p: ({ ...props }) => (
                      <p className="my-0 leading-relaxed inline" {...props} />
                    ),
                    ul: ({ ...props }) => (
                      <ul className="list-disc pl-4 my-1" {...props} />
                    ),
                    ol: ({ ...props }) => (
                      <ol className="list-decimal pl-4 my-1" {...props} />
                    ),
                  }}
                >
                  {savedContent}
                </Markdown>
              </div>
              {isLongText && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="flex items-center gap-1 text-xs text-neutral-500 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-100 mt-1 font-medium transition-colors"
                >
                  {isExpanded ? (
                    <>
                      Mostra meno <ChevronUp size={14} />
                    </>
                  ) : (
                    <>
                      Mostra tutto <ChevronDown size={14} />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
          <div className="w-full flex justify-end items-center mt-1">
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex flex-row gap-4 items-center"
            >
              {note.type == "NOTE" && (
                <Pencil
                  className="text-text-1 dark:text-zinc-400 cursor-pointer hover:text-black dark:hover:text-zinc-100 transition-colors"
                  size={18}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSent(false);
                  }}
                />
              )}

              <AlertDialogComponent
                icon={
                  <TrashIcon
                    className="text-text-1 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer transition-colors duration-200"
                    size={20}
                  />
                }
                title={`Vuoi eliminare la ${
                  note.type === "NOTE" ? "nota" : "evidenziazione"
                }?`}
                desc={`Sei sicuro di voler eliminare la ${
                  note.type === "NOTE" ? "nota" : "evidenziazione"
                }?`}
                onAction={() => {
                  deleteNote(note.note_id);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesSidebarElement;
