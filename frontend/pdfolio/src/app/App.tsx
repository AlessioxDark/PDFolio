import { BrowserRouter, Route, Routes, useNavigate } from "react-router";
import Login from "./pages/Login";
import { useEffect } from "react";
import AppRouter from "./AppRouter";
import { AuthContextProvider } from "../contexts/AuthContext";
import { NotesContextProvider } from "../contexts/NotesContext";

function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <NotesContextProvider>
          <AppRouter />
        </NotesContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
