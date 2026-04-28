import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../config/db.js";
import { apiCalls } from "../services/api.js";
export const AuthContext = createContext({
  session: null,
  LoginUser: (arg) => {},
  SignUpUser: (arg) => {},
});
export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const LoginUser = async (formData) => {
    try {
      const { email, password, rememberMe } = formData;
      localStorage.setItem("remember", rememberMe.toString());
      const { data, error } = await apiCalls.authService.loginUser({
        email,
        password,
      });
      console.log("data", data);
      console.log("error", error);
      if (error) throw error;
      setSession(data.session);
      return { data: session, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };
  const SignUpUser = async (payloadData) => {
    try {
      console.log("payloadData", payloadData);
      const { email, password, full_name, handle } = payloadData;
      const { data, error } = await apiCalls.authService.signUp({
        email,
        password,
        handle,
      });
      if (error) return { error, data: null };
      setSession(data.session);
      console.log("chiamo createProfile");
      const { data: profileData, error: profileError } =
        await apiCalls.userService.createProfile({
          user_id: data.user.id,
          email,
          full_name,
          handle,
        });
      localStorage.setItem("remember", "true");

      if (profileError) return { error: profileError, data: null };
      return { data: session, error: null };
    } catch (err) {
      console.log("err", err);
      return { data: null, error: err };
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const wantToBeRemembered = localStorage.getItem("remember") === "true";
      if (session && !wantToBeRemembered) {
        await supabase.auth.signOut();
        setSession(null);
      } else {
        setSession(session);
      }
      setIsAuthLoading(false);
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthLoading(true);
      setSession(session);
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  return (
    <AuthContext.Provider
      value={{ session, LoginUser, SignUpUser, isAuthLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
