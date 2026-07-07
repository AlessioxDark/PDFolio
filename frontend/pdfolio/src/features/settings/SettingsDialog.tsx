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
const SettingsDialog = ({ isOpen, setIsOpen }) => {
  const { profileData, setProfileData } = useProfile();
  const [isDisabled, setIsDisabled] = useState(true);
  const [newData, setNewData] = useState(profileData);
  const [errorMessage, setErrorMessage] = useState("");
  const { session } = useAuth();
  const { loading, executeApiCall } = useApi();
  const handleSave = async () => {
    executeApiCall(
      "edit_profile",
      () => {
        return apiCalls.profile.editProfile(session, newData);
      },
      {
        onError: (error) => {
          setErrorMessage(error.message);
        },
        onSuccess: (data) => {
          setProfileData(newData);
          setTimeout(() => {
            setIsOpen(false);
          }, 800);
        },
      },
    );
  };

  useEffect(() => {
    if (!profileData) return;
    let disable = true;
    for (let key in profileData) {
      if (profileData[key] !== newData[key]) {
        disable = false;
        break;
      }
      setIsDisabled(disable);
    }
    setIsDisabled(disable);
  }, [profileData, newData]);

  if (loading?.get_profile) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-neutral-2 dark:bg-zinc-900">
        <LoadingState text={"Caricamento del profilo..."} />
      </div>
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

        <div className="flex flex-col gap-5 py-2">
          {/* NOME DOCUMENTO */}
          <div className="flex flex-col gap-2">
            <div className="w-full flex justify-center">
              <div className="relative group cursor-pointer shrink-0">
                <div>
                  {newData.avatar_url ? (
                    <img
                      src={newData.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <DefaultPfpIcon
                      size={80}
                      className="text-neutral-400 dark:text-zinc-500 "
                    />
                  )}
                </div>
                {/* Overlay della fotocamera allo Hover */}
              </div>{" "}
            </div>
            <label className="font-inter text-[11px] font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider block">
              Nome Account
            </label>
            <input
              type="text"
              value={newData.full_name}
              onChange={(e) => {
                setNewData((prev) => {
                  return { ...prev, full_name: e.target.value };
                });
              }}
              disabled={loading?.edit_profile}
              placeholder="Es. Dispensa di Economia"
              className="w-full rounded-xl border border-neutral-200 dark:border-zinc-800 p-3 text-sm font-semibold text-neutral-800 dark:text-zinc-200 bg-white dark:bg-zinc-950/20 placeholder-neutral-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-accent dark:focus:ring-purple-500 focus:border-accent dark:focus:border-purple-500 transition-all"
            />
            <label className="font-inter text-[11px] font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider block">
              Tag Utente
            </label>
            <input
              type="text"
              value={newData.handle}
              onChange={(e) => {
                setNewData((prev) => {
                  return { ...prev, handle: e.target.value };
                });
              }}
              disabled={loading?.edit_profile}
              placeholder="Es. Dispensa di Economia"
              className="w-full rounded-xl border border-neutral-200 dark:border-zinc-800 p-3 text-sm font-semibold text-neutral-800 dark:text-zinc-200 bg-white dark:bg-zinc-950/20 placeholder-neutral-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-accent dark:focus:ring-purple-500 focus:border-accent dark:focus:border-purple-500 transition-all"
            />
            <label className="font-inter text-[11px] font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider block">
              Biografia
            </label>
            <div className="w-full flex flex-col rounded-xl border border-neutral-200 dark:border-zinc-800 px-3.5 py-2.5 bg-white dark:bg-zinc-950/20 \ focus:ring-1 focus:ring-accent dark:focus:ring-purple-500 focus:border-accent dark:focus:border-purple-500 transition-all duration-200">
              <textarea
                value={newData.biography}
                onChange={(e) => {
                  setNewData((prev) => {
                    return { ...prev, biography: e.target.value };
                  });
                }}
                rows={3}
                placeholder="Scrivi qualcosa su di te..."
                className="w-full border-none outline-none text-sm text-neutral-800 dark:text-zinc-200 placeholder-neutral-400 dark:placeholder-zinc-600 font-inter resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100/80 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium animate-in fade-in duration-200">
              <AlertCircleIcon size={15} className="shrink-0 mt-0.5" />
              <span className="leading-normal">{errorMessage}</span>
            </div>
          )}
        </div>

        {/* CONTROLLI DI FOOTER */}
        <div className="pt-4 border-t border-neutral-100 dark:border-zinc-800 mt-4 flex flex-row sm:justify-end gap-2.5">
          <AlertDialogCancel
            onClick={() => setIsOpen(false)}
            disabled={loading?.edit_profile}
            className="flex-1 sm:flex-none px-5 h-11 bg-neutral-50 dark:bg-zinc-800 hover:bg-neutral-100 dark:hover:bg-zinc-700 border border-neutral-200 dark:border-zinc-700 text-neutral-600 dark:text-zinc-300 hover:text-neutral-900 dark:hover:text-zinc-100 font-semibold rounded-xl cursor-pointer transition-colors text-sm"
          >
            Annulla
          </AlertDialogCancel>
          <button
            onClick={handleSave}
            disabled={isDisabled || loading?.edit_profile}
            className="flex-1 sm:flex-none px-5 h-11 bg-accent dark:bg-purple-600 hover:bg-accent/90 dark:hover:bg-purple-500 border-none text-white font-bold rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm shadow-md shadow-accent/10"
          >
            {loading?.edit_profile ? (
              <>
                <Loader2Icon size={15} className="animate-spin" />
                Salvataggio...
              </>
            ) : (
              "Salva"
            )}
          </button>
        </div>
        {/* CONTROLLI DI FOOTER */}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SettingsDialog;
