import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../config/db.js";
import { apiCalls } from "../services/api.js";
import { useAuth } from "./AuthContext.js";
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
  const { session } = useAuth();

  const fetchNotes = async (pdfId: string) => {
    console.log("pdf", pdfId);
    const { data, error } = await apiCalls.notes.getNotesByDocumentId(
      session?.access_token,
      pdfId,
    );
    if (error) {
      console.error("Errore nel caricamento delle note:", error);
      return;
    }
    if (data) {
      console.log("Note caricate:", data);
      setNotesArray(data);
    }
  };
  const addNote = (note: any) => {
    setNotesArray((prev) => [...prev, note]);
  };
  const deleteNote = (id: string) => {
    setNotesArray((prev) => prev.filter((note) => note.id !== id));
  };
  return (
    <NotesContext.Provider
      value={{ notesArray, addNote, deleteNote, setNotesArray, fetchNotes }}
    >
      {children}
    </NotesContext.Provider>
  );
};
