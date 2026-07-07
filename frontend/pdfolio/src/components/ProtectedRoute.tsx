import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import LoadingState from "./states/LoadingState";
import { useApi } from "@/contexts/ApiContext";

const ProtectedRoute = ({ children }) => {
  const { session, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { loading } = useApi();
  useEffect(() => {
    console.log("qui ci arriva?", session);
    if (!session && !isAuthLoading) {
      console.log("non hai session", session, isAuthLoading);
      navigate("/login");
    }
  }, [session, isAuthLoading]);
  if (isAuthLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-neutral-2 dark:bg-zinc-900">
        <LoadingState text={"Caricamento Sessione..."} />
      </div>
    );
  }
  if (loading?.log_out) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-neutral-2 dark:bg-zinc-900">
        <LoadingState text={"Uscendo dalla Sessione..."} />
      </div>
    );
  }
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
