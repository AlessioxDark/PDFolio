import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import ProtectedRoute from "../components/ProtectedRoute";
import SidebarLayout from "../components/SidebarLayout";
import PdfPage from "./pages/PdfPage";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/pdf/:pdfId" element={<PdfPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<SidebarLayout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRouter;
