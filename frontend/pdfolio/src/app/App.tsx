import { BrowserRouter, Route, Routes, useNavigate } from "react-router";
import Login from "./pages/Login";
import { useEffect } from "react";
import AppRouter from "./AppRouter";
import { AuthContextProvider } from "../contexts/AuthContext";
import { NotesContextProvider } from "../contexts/NotesContext";
import { DocumentsAndFoldersContextProvider } from "../contexts/DocumentsAndFolderContext";
import { SearchContextProvider } from "@/contexts/SearchContext";
import { ProfileContextProvider } from "@/contexts/ProfileContext";
import { ThemeContextProvider } from "@/contexts/ThemeContext";
import ApiContextProvider from "@/contexts/ApiContext";

function App() {
  return (
    <BrowserRouter>
      <ApiContextProvider>
        <AuthContextProvider>
          <ProfileContextProvider>
            <ThemeContextProvider>
              <SearchContextProvider>
                <DocumentsAndFoldersContextProvider>
                  <NotesContextProvider>
                    <AppRouter />
                  </NotesContextProvider>
                </DocumentsAndFoldersContextProvider>
              </SearchContextProvider>
            </ThemeContextProvider>
          </ProfileContextProvider>
        </AuthContextProvider>
      </ApiContextProvider>
    </BrowserRouter>
  );
}

export default App;
