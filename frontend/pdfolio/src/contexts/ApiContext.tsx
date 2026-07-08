import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../config/db.js";
import { apiCalls } from "../services/api.js";
export const ApiContext = createContext({
  executeApiCall: (type, apiCall, onSuccess) => {},
  loading: {},
  error: {},
});
export const useApi = () => {
  const context = useContext(ApiContext);
  return context;
};

export const ApiContextProvider = ({ children }) => {
  const [loading, setLoading] = useState({
    delete_folder: false,
    home: false,
    update_pdf: false,
    upload_pdf: false,
    get_pdf: false,
    save_note: false,
    mark_messages_as_saved: false,
    ask_ai: false,
    update_note: false,
    mark_message_as_modified: false,
    mark_message_as_rejected: false,
    trash_bin: false,
    trash_bin_delete: false,
    trash_bin_restore: false,
    trash_pdf_file: false,
    login: false,
    sign_up: false,
    create_profile: false,
    get_notes: false,
    get_profile: false,
    export_summary: false,
    global_search: false,
    edit_profile: false,
    log_out: false,
    delete_note: false,
  });
  const [error, setError] = useState({
    home: null,
    delete_folder: null,
    update_pdf: null,
    create_folder: null,
    upload_pdf: null,
    get_pdf: null,
    save_note: null,
    mark_messages_as_saved: null,
    ask_ai: null,
    update_note: null,
    mark_message_as_modified: null,
    mark_message_as_rejected: null,
    trash_pdf_file: null,
    trash_bin: null,
    trash_bin_delete: null,
    trash_bin_restore: null,
    login: null,
    sign_up: null,
    create_profile: null,
    get_notes: null,
    get_profile: null,
    export_summary: null,
    global_search: null,
    edit_profile: null,
    log_out: null,
    delete_note: null,
  });
  const executeApiCall = async (
    type: string,
    apiCall: () => Promise<any>,
    {
      onSuccess = null,
      onError = null,
      startLoading = true, // Di default mostra il loading
      endLoading = true, // Di default spegne il loading alla fine
    } = {},
  ) => {
    if (startLoading) {
      setLoading((prev) => ({ ...prev, [type]: true }));
    }
    setError((prev) => ({ ...prev, [type]: null }));
    try {
      const result = await apiCall();
      if (onSuccess) onSuccess(result.data);
    } catch (error) {
      setError((prev) => ({ ...prev, [type]: error }));
      if (onError) onError(error);

      // Se l'API fallisce, dobbiamo COMUNQUE spegnere il loading (se era partito)
      // altrimenti l'app rimane bloccata in uno stato di errore con lo spinner attivo
      if (startLoading) {
        setLoading((prev) => ({ ...prev, [type]: false }));
      }
    } finally {
      if (startLoading && endLoading) {
        setLoading((prev) => ({ ...prev, [type]: false }));
      }
    }
  };
  return (
    <ApiContext.Provider value={{ executeApiCall, error, loading }}>
      {children}
    </ApiContext.Provider>
  );
};
export default ApiContextProvider;
