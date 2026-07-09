import React, { useEffect, useState, useRef } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircleIcon, Camera, Loader2Icon, User, X } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import DefaultPfpIcon from "@/icons/DefaultPfpIcon";
import { apiCalls } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import LoadingState from "@/components/states/LoadingState";
import { useApi } from "@/contexts/ApiContext";
import ErrorState from "@/components/states/ErrorState";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
const SettingsDialog = ({ isOpen, setIsOpen }) => {
  const schema = z.object({
    handle: z
      .string()
      .min(1, "Il tag utente è obbligatorio")
      .regex(/^[a-z0-9_]+$/, "Usa solo lettere minuscole, numeri e underscore")
      .transform((val) => val.toLowerCase()),
    full_name: z
      .string()
      .min(1, "Il nome account è obbligatorio")
      .regex(
        /^[\p{L}\s\-']+$/u,
        "Inserisci un nome valido (solo lettere, spazi, trattini e apostrofi)",
      ),
    biography: z
      .string()
      .min(5, "Inserisci almeno 5 caratteri")
      .max(250, "La biografia non può superare i 250 caratteri")
      .optional()
      .or(z.literal("")),
  });

  type FormFields = z.infer<typeof schema>;

  const { profileData, setProfileData, getProfileData } = useProfile();
  const [errorMessage, setErrorMessage] = useState("");
  const { session } = useAuth();
  const { loading, executeApiCall, error: errorApi } = useApi();

  const methods = useForm<FormFields>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    setError,
    reset,
  } = methods;

  useEffect(() => {
    if (profileData && isOpen) {
      reset({
        full_name: profileData.full_name || "",
        handle: profileData.handle || "",
        biography: profileData.biography || "",
      });
      setErrorMessage("");
    }
  }, [profileData, isOpen, reset]);

  const onSubmit = async (data: FormFields) => {
    executeApiCall(
      "edit_profile",
      () => {
        return apiCalls.profile.editProfile(session, {
          ...profileData,
          ...data,
        });
      },
      {
        onError: (error) => {
          const msg = error?.message || "";
          if (
            msg.toLowerCase().includes("unique") ||
            msg.toLowerCase().includes("duplicate") ||
            msg.toLowerCase().includes("handle")
          ) {
            setError("handle", {
              type: "manual",
              message: "Questo tag utente è già in uso. Scegline un altro.",
            });
          } else {
            setErrorMessage(
              msg || "Impossibile salvare le modifiche. Riprova.",
            );
          }
        },
        onSuccess: () => {
          setProfileData((prev) => ({ ...prev, ...data }));
          setTimeout(() => {
            setIsOpen(false);
          }, 800);
        },
      },
    );
  };

  if (errorApi?.get_profile && isOpen) {
    return (
      <AlertDialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
        }}
      >
        <AlertDialogContent className="max-w-[500px] p-6 dark:bg-zinc-900 dark:border-zinc-800 rounded-2xl bg-white border border-neutral-200/60 shadow-2xl gap-0 font-sans">
          <div className="flex flex-row justify-between items-start">
            <AlertDialogHeader className="pb-4">
              <AlertDialogTitle className="text-xl font-bold text-neutral-900 dark:text-zinc-100 tracking-tight">
                Impostazioni profilo
              </AlertDialogTitle>
              <p className="text-xs text-neutral-400 dark:text-zinc-500 mt-0.5">
                Modifica le impostazioni del tuo account
              </p>
            </AlertDialogHeader>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-neutral-400 cursor-pointer dark:text-zinc-500 hover:text-neutral-900 dark:hover:text-zinc-200 rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <ErrorState
            message={errorApi?.get_profile?.message}
            onRetry={getProfileData}
          />
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (loading?.get_profile) {
    return (
      <AlertDialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
        }}
      >
        <AlertDialogContent className="max-w-[500px] p-6 dark:bg-zinc-900 dark:border-zinc-800 rounded-2xl bg-white border border-neutral-200/60 shadow-2xl gap-0 font-sans">
          <div className="flex flex-row justify-between items-start">
            <AlertDialogHeader className="pb-4">
              <AlertDialogTitle className="text-xl font-bold text-neutral-900 dark:text-zinc-100 tracking-tight">
                Impostazioni profilo
              </AlertDialogTitle>
              <p className="text-xs text-neutral-400 dark:text-zinc-500 mt-0.5">
                Modifica le impostazioni del tuo account
              </p>
            </AlertDialogHeader>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-neutral-400 cursor-pointer dark:text-zinc-500 hover:text-neutral-900 dark:hover:text-zinc-200 rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <LoadingState text={"Caricamento del profilo..."} />
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
      }}
    >
      <AlertDialogContent className="max-w-[500px] p-6 dark:bg-zinc-900 dark:border-zinc-800 rounded-2xl bg-white border border-neutral-200/60 shadow-2xl gap-0 font-sans">
        <div className="flex flex-row justify-between items-start">
          <AlertDialogHeader className="pb-4">
            <AlertDialogTitle className="text-xl font-bold text-neutral-900 dark:text-zinc-100 tracking-tight">
              Impostazioni profilo
            </AlertDialogTitle>
            <p className="text-xs text-neutral-400 dark:text-zinc-500 mt-0.5">
              Modifica le impostazioni del tuo account
            </p>
          </AlertDialogHeader>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-neutral-400 cursor-pointer dark:text-zinc-500 hover:text-neutral-900 dark:hover:text-zinc-200 rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 py-2"
        >
          {/* FOTO PROFILO */}
          <div className="flex flex-col gap-2">
            <div className="w-full flex justify-center">
              <div className="relative group cursor-pointer shrink-0">
                <div>
                  {profileData?.avatar_url ? (
                    <img
                      src={profileData.avatar_url}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border border-neutral-200 dark:border-zinc-800"
                    />
                  ) : (
                    <DefaultPfpIcon
                      size={80}
                      className="text-neutral-400 dark:text-zinc-500"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* NOME ACCOUNT */}
            <label className="font-inter text-[11px] font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider block">
              Nome Account
            </label>
            <div className="flex flex-col gap-0.5">
              <input
                type="text"
                {...register("full_name")}
                disabled={loading?.edit_profile}
                placeholder="Nome e Cognome"
                className={`w-full rounded-xl border p-3 text-sm font-semibold text-neutral-800 dark:text-zinc-200 bg-white dark:bg-zinc-950/20 placeholder-neutral-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 transition-all ${
                  errors.full_name
                    ? "border-red-500/60 dark:border-red-500/40 focus:ring-red-500/30 focus:border-red-500"
                    : "border-neutral-200 dark:border-zinc-800 focus:ring-accent dark:focus:ring-purple-500 focus:border-accent dark:focus:border-purple-500"
                }`}
              />
              {errors.full_name && (
                <span className="text-red-500 dark:text-red-400 font-medium text-[11px] flex items-center gap-1 mt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  <AlertCircleIcon size={12} className="shrink-0" />
                  {errors.full_name.message}
                </span>
              )}
            </div>
            {/* TAG UTENTE */}
            <div className="flex flex-col gap-0.5">
              <label className="font-inter text-[11px] font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider block">
                Handle Utente{" "}
              </label>
              <input
                type="text"
                {...register("handle")}
                disabled={loading?.edit_profile}
                placeholder="username"
                className={`w-full rounded-xl border p-3 text-sm font-semibold text-neutral-800 dark:text-zinc-200 bg-white dark:bg-zinc-950/20 placeholder-neutral-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 transition-all ${
                  errors.handle
                    ? "border-red-500/60 dark:border-red-500/40 focus:ring-red-500/30 focus:border-red-500"
                    : "border-neutral-200 dark:border-zinc-800 focus:ring-accent dark:focus:ring-purple-500 focus:border-accent dark:focus:border-purple-500"
                }`}
              />
              {errors.handle && (
                <span className="text-red-500 dark:text-red-400 font-medium text-[11px] flex items-center gap-1 mt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  <AlertCircleIcon size={12} className="shrink-0" />
                  {errors.handle.message}
                </span>
              )}
            </div>
            {/* BIOGRAFIA */}
            <div className="flex flex-col gap-0.5">
              <label className="font-inter text-[11px] font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider block">
                Biografia
              </label>
              <div
                className={`w-full flex flex-col rounded-xl border px-3.5 py-2.5 bg-white dark:bg-zinc-950/20 transition-all duration-200 ${
                  errors.biography
                    ? "border-red-500/60 dark:border-red-500/40 focus-within:ring-1 focus-within:ring-red-500/30 focus-within:border-red-500"
                    : "border-neutral-200 dark:border-zinc-800 focus-within:ring-1 focus-within:ring-accent dark:focus-within:ring-purple-500 focus-within:border-accent dark:focus-within:border-purple-500"
                }`}
              >
                <textarea
                  rows={3}
                  {...register("biography")}
                  disabled={loading?.edit_profile}
                  placeholder="Scrivi qualcosa su di te..."
                  className="w-full border-none outline-none text-sm text-neutral-800 dark:text-zinc-200 bg-transparent placeholder-neutral-400 dark:placeholder-zinc-600 font-inter resize-none leading-relaxed"
                />
              </div>
              {errors.biography && (
                <span className="text-red-500 dark:text-red-400 font-medium text-[11px] flex items-center gap-1 mt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  <AlertCircleIcon size={12} className="shrink-0" />
                  {errors.biography.message}
                </span>
              )}
            </div>
          </div>

          {/* ERROR ALERT BANNER */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100/80 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium animate-in fade-in duration-200">
              <AlertCircleIcon size={15} className="shrink-0 mt-0.5" />
              <span className="leading-normal">{errorMessage}</span>
            </div>
          )}

          {/* CONTROLLI DI FOOTER */}
          <div className="pt-4 border-t border-neutral-100 dark:border-zinc-800 mt-4 flex flex-row sm:justify-end gap-2.5">
            <AlertDialogCancel
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={loading?.edit_profile}
              className="flex-1 sm:flex-none px-5 h-11 bg-neutral-50 dark:bg-zinc-800 hover:bg-neutral-100 dark:hover:bg-zinc-700 border border-neutral-200 dark:border-zinc-700 text-neutral-600 dark:text-zinc-300 hover:text-neutral-900 dark:hover:text-zinc-100 font-semibold rounded-xl cursor-pointer transition-colors text-sm"
            >
              Annulla
            </AlertDialogCancel>
            <button
              type="submit"
              disabled={!isDirty || !isValid || loading?.edit_profile}
              className="flex-1 sm:flex-none px-5 h-11 bg-accent dark:bg-purple-600 hover:bg-accent/90 dark:hover:bg-purple-500 border-none text-white font-bold rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm shadow-md shadow-accent/10"
            >
              {loading?.edit_profile ? (
                <div className="flex items-center gap-1.5 justify-center">
                  <Loader2Icon size={15} className="animate-spin" />
                  <span>Salvataggio...</span>
                </div>
              ) : (
                "Salva"
              )}
            </button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SettingsDialog;
