import { BrowserRouter, Route, Routes, useNavigate } from "react-router";
import Login from "./pages/Login";
import { useEffect } from "react";
import AppRouter from "./AppRouter";
import { AuthContextProvider } from "../contexts/AuthContext";
import { NotesContextProvider } from "../contexts/NotesContext";
import { DocumentsAndFoldersContextProvider } from "../contexts/DocumentsAndFolderContext";
import { SearchContextProvider } from "@/contexts/SearchContext";

function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <SearchContextProvider>
          <DocumentsAndFoldersContextProvider>
            <NotesContextProvider>
              <AppRouter />
            </NotesContextProvider>
          </DocumentsAndFoldersContextProvider>
        </SearchContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
