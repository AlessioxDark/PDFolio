import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { session, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    console.log("qui ci arriva?", session);
    if (!session && !isAuthLoading) {
      console.log("non hai session", session, isAuthLoading);
      navigate("/login");
    }
  }, [session, isAuthLoading]);
  if (isAuthLoading) {
    return <div>Loading...</div>;
  }
  return children;
};

export default ProtectedRoute;
