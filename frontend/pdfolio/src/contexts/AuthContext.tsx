import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../config/db.js";
import { apiCalls } from "../services/api.js";
import { useApi } from "./ApiContext.js";
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
  const { executeApiCall } = useApi();
  const LoginUser = async (formData) => {
    const { email, password, rememberMe } = formData;
    localStorage.setItem("remember", rememberMe.toString());
    return new Promise((resolve) => {
      executeApiCall(
        "login",
        () => {
          return apiCalls.authService.loginUser({
            email,
            password,
          });
        },
        {
          onSuccess: (data) => {
            setSession(data.session);
            // resolve fa sbloccare l'await in onSubmit e passa i dati
            resolve({ data: data.session, error: null });
          },
          onError: (error) => {
            // resolve passa l'errore a onSubmit senza far crashare l'app
            resolve({ data: null, error: error });
          },
        },
      );
    });
  };
  const SignUpUser = async (payloadData) => {
    const { email, password, full_name, handle } = payloadData;

    // 1. Eseguiamo il SignUp
    return new Promise((resolve) => {
      // 2. Primo Step: Registrazione Auth
      executeApiCall(
        "sign_up",
        () => {
          return apiCalls.authService.signUp({
            email,
            password,
            handle,
          });
        },
        {
          onSuccess: (signUpData) => {
            setSession(signUpData.session);

            // Estraiamo l'ID utente appena creato direttamente dalla risposta del server
            const freshUserId = signUpData.session?.user?.id;

            if (!freshUserId) {
              resolve({
                data: null,
                error: { message: "ID utente non generato dal server." },
              });
              return;
            }

            console.log(
              "Sign up completato. Ora creo il profilo per:",
              freshUserId,
            );

            // 3. Secondo Step: Creazione Profilo nel DB (dentro l'onSuccess del primo)
            executeApiCall(
              "create_profile",
              () => {
                return apiCalls.userService.createProfile({
                  user_id: freshUserId,
                  email,
                  full_name,
                  handle,
                });
              },
              {
                onSuccess: (profileData) => {
                  localStorage.setItem("remember", "true");

                  // 🔥 Entrambi gli step sono completati con successo!
                  // Risolviamo la Promise principale passando i dati a onSubmit
                  resolve({ data: signUpData.session, error: null });
                },
                onError: (profileError) => {
                  console.error("Errore durante create_profile:", profileError);
                  // Se fallisce il profilo, rispondiamo a onSubmit con l'errore del profilo
                  resolve({ data: null, error: profileError });
                },
              },
            );
          },
          onError: (signUpError) => {
            console.error("Errore durante il sign_up:", signUpError);
            // Se fallisce il sign-up iniziale, rispondiamo subito a onSubmit con l'errore
            resolve({ data: null, error: signUpError });
          },
        },
      );
    });
  };

  const LogOut = async () => {
    return new Promise((resolve) => {
      executeApiCall(
        "log_out",
        () => {
          return apiCalls.authService.logOut();
        },
        {
          onSuccess: () => {
            setSession(null);
            localStorage.setItem("remember", "false");
            resolve({ data: { success: true }, error: null });
          },
          onError: (error) => {
            console.error("Errore durante il log_out:", error);
            resolve({ data: null, error: error });
          },
        },
      );
    });
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
      value={{ session, LoginUser, SignUpUser, isAuthLoading, LogOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
