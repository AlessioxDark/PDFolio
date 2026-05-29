import React, { useRef, useState } from "react";
import CheckIcon from "../icons/CheckIcon";
import { apiCalls } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import TrashIcon from "../icons/TrashIcon";
import { Pencil } from "lucide-react";
import { AlertDialogComponent } from "./AlertDialogComponent";
import { useNotes } from "@/contexts/NotesContext";

const NotesSidebarElement = ({
  note,
  scrollToNoteInPdf,
}: {
  note: any;
  scrollToNoteInPdf: (notePosition: any) => void;
}) => {
  const { deleteNote } = useNotes();
  const chatInputRef = useRef<HTMLDivElement>(null);
  const { session } = useAuth();
  const [noteInput, setNoteInput] = useState(note.content || "");
  const [savedContent, setSavedContent] = useState(note.content || "");
  const [isSent, setIsSent] = useState(note.content && note.content.length > 0);
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setNoteInput(e.currentTarget.textContent || "");
  };

  return (
    <div
      className={`w-full rounded-xl bg-neutral-2 px-4 py-3 border-l-[5px]   cursor-pointer transition-all group flex flex-col gap-2 ${note.type === "HIGHLIGHT" ? "border-[#FDE047]" : "border-accent"} shadow-[0_20px_30px_rgba(0,0,0,0.10)]`}
      onClick={() => {
        scrollToNoteInPdf(note.position);
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2">
          <div
            className={`aspect-square h-4 rounded-md ${note.type === "HIGHLIGHT" ? "bg-[#FDE047]" : "bg-accent"}`}
          />
          <span className="font-semibold text-[10px] font-inter text-text-1">
            Pagina {note.position.page}
          </span>
        </div>
        <div className="px-2 flex flex-col gap-2">
          <div className="leading-relaxed">
            <span
              className={`font-medium break-words rounded-[2px] ${
                note.type === "HIGHLIGHT"
                  ? "text-text-1 text-sm"
                  : "text-black text-xl"
              }`}
              style={{
                // Colore di sfondo con opacità per simulare la selezione
                backgroundColor:
                  note.type === "HIGHLIGHT"
                    ? "rgba(253, 224, 71, 0.5)"
                    : "rgba(147, 51, 234, 0.4)",

                // Il "trucco" per sembrare selezione Windows:
                // Padding orizzontale ridotto, verticale quasi nullo
                padding: "0px 2px",

                // Serve a far sì che il background si spezzi correttamente a capo
                WebkitBoxDecorationBreak: "clone",
                boxDecorationBreak: "clone",

                // Rimuove il distacco tra le linee per un look più compatto
                lineHeight: "1.5",
              }}
            >
              {note.text}
            </span>
          </div>

          {note.type == "NOTE" &&
            (!isSent ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex flex-row items-end gap-2 mt-2 w-full bg-white/70 border border-neutral-4 rounded-xl p-2 focus-within:ring-1 focus-within:ring-neutral-400 transition-all duration-200"
              >
                <div
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  ref={chatInputRef}
                  className="flex-1 min-h-[24px] max-h-24 outline-none text-sm text-text-1 font-inter overflow-y-auto px-1 py-0.5 empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-4 empty:before:pointer-events-none"
                  onInput={handleInput}
                  data-placeholder="Inserisci testo nota"
                >
                  {savedContent}
                </div>
                <button
                  type="button"
                  aria-label="Invia messaggio"
                  onClick={() => {
                    if (noteInput.trim().length > 0) {
                      const isModification =
                        note.content && note.content.length > 0;
                      if (isModification) {
                        const { error } = apiCalls.notes.UpdateNoteInDB(
                          session?.access_token,
                          note.document_id,
                          note.note_id,
                          noteInput, // Il testo modificato
                        );
                        if (error)
                          console.error("Errore durante la PATCH:", error);
                      } else {
                        const { error } = apiCalls.notes.SaveNoteToDB(
                          session?.access_token,
                          note.document_id,
                          {
                            ...note,
                            content: noteInput,
                          },
                        );
                        if (error)
                          console.error("Errore durante la PATCH:", error);
                      }
                      setSavedContent(noteInput);
                      setIsSent(true);
                    }
                  }}
                >
                  <CheckIcon
                    iconColor="#ffffff"
                    size={16}
                    className={`${
                      noteInput.trim().length > 0 ? "bg-accent" : ""
                    } flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-150`}
                    bgColor="#9333ea"
                  />
                </button>
              </div>
            ) : (
              <span
                className={`font-medium break-words rounded-[2px] ${"text-text-1 text-sm"} italic`}
              >
                "{savedContent}"
              </span>
            ))}
          <div className="w-full flex justify-end items-center">
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex flex-row gap-4 items-center"
            >
              <Pencil
                className="text-text-1"
                size={18}
                onClick={(e) => {
                  e.stopPropagation(); // Evita lo scroll del PDF al click della matita
                  setIsSent(false); // Riapre il box di input con il vecchio testo dentro
                }}
              />

              <AlertDialogComponent
                icon={
                  <TrashIcon
                    className="text-text-1 hover:text-red-400 transition-colors duration-300"
                    size={20}
                  />
                }
                title={`Vuoi eliminare la ${note.type === "NOTE" ? "nota" : "evidenziazione"}?`}
                desc={`Sei sicuro di voler eliminare la ${note.type === "NOTE" ? "nota" : "evidenziazione"}?`}
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
