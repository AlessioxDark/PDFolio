import { BrowserRouter, Route, Routes, useNavigate } from "react-router";
import Login from "./pages/Login";
import { useEffect } from "react";
import AppRouter from "./AppRouter";
import { AuthContextProvider } from "../contexts/AuthContext";
import { NotesContextProvider } from "../contexts/NotesContext";
import { DocumentsAndFoldersContextProvider } from "../contexts/DocumentsAndFolderContext";

function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <DocumentsAndFoldersContextProvider>
          <NotesContextProvider>
            <AppRouter />
          </NotesContextProvider>
        </DocumentsAndFoldersContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
