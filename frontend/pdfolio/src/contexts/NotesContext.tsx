import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../config/db.js";
import { apiCalls } from "../services/api.js";
import { useAuth } from "./AuthContext.js";
import { useApi } from "./ApiContext.js";
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
    console.log("pdf", pdfId);
    setCurrentPdfId(pdfId);
    executeApiCall(
      "get_notes",
      () => {
        return apiCalls.notes.getNotesByDocumentId(
          session?.access_token,
          pdfId,
        );
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
    setNotesArray((prev) => prev.filter((note) => note.note_id !== id));

    const { error } = await apiCalls.notes.deleteNoteFromDB(
      session?.access_token,
      currentPdfId,
      id,
    );
    if (error) {
      console.error("Errore nell'eliminazione della nota:", error);
      return;
    }
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
