import React, { createContext, useContext, useEffect, useState } from "react";
import { apiCalls } from "../services/api.js";
import { useAuth } from "./AuthContext.js";
import { useApi } from "./ApiContext.js";
import { toast } from "sonner";
export const NotesContext = createContext({
  notesArray: [],
  addNote: (note: any) => {},
  deleteNote: (id: string) => {},
  setNotesArray: (notes: any) => {},
});
export const useNotes = () => {
  const context = useContext(NotesContext);
  return context;
};

export const NotesContextProvider = ({ children }) => {
  const [notesArray, setNotesArray] = useState([]);
  const [currentPdfId, setCurrentPdfId] = useState(null);
  const { session } = useAuth();
  const { executeApiCall } = useApi();
  const fetchNotes = async (pdfId: string) => {
    setCurrentPdfId(pdfId);
    executeApiCall(
      "get_notes",
      () => {
        return apiCalls.notes.getNotesByDocumentId(session, pdfId);
      },
      {
        onSuccess: (data) => {
          setNotesArray(data);
        },
        onError: (error) => {
          console.error("Errore nel caricamento delle note:", error);
        },
      },
    );
  };
  const addNote = (note: any) => {
    setNotesArray((prev) => [...prev, note]);
  };
  const deleteNote = async (id: string) => {
    executeApiCall(
      "delete_note",
      () => {
        return apiCalls.notes.deleteNoteFromDB(session, currentPdfId, id);
      },
      {
        onSuccess: (data) => {
          setNotesArray((prev) => prev.filter((note) => note.note_id !== id));
        },
        onError: (error) => {
          console.log("errore", error);

          toast.error(error?.message);
        },
      },
    );
  };
  return (
    <NotesContext.Provider
      value={{
        notesArray,
        addNote,
        deleteNote,
        setNotesArray,
        fetchNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};
