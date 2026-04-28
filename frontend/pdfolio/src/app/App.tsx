import { BrowserRouter, Route, Routes, useNavigate } from "react-router";
import Login from "./pages/Login";
import { useEffect } from "react";
import AppRouter from "./AppRouter";
import { AuthContextProvider } from "../contexts/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <AppRouter />
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
