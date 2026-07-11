import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router";

interface ApiInterface {
  loading: {
    delete_folder: boolean;
    home: boolean;
    update_pdf: boolean;
    upload_pdf: boolean;
    get_pdf: boolean;
    save_note: boolean;
    mark_messages_as_saved: boolean;
    ask_ai: boolean;
    update_note: boolean;
    mark_message_as_modified: boolean;
    mark_message_as_rejected: boolean;
    trash_bin: boolean;
    trash_bin_delete: boolean;
    trash_bin_restore: boolean;
    trash_pdf_file: boolean;
    login: boolean;
    sign_up: boolean;
    create_profile: boolean;
    get_notes: boolean;
    get_profile: boolean;
    export_summary: boolean;
    global_search: boolean;
    edit_profile: boolean;
    log_out: boolean;
    delete_note: boolean;
  };
  error: {
    home: null;
    delete_folder: null;
    update_pdf: null;
    create_folder: null;
    upload_pdf: null;
    get_pdf: null;
    save_note: null;
    mark_messages_as_saved: null;
    ask_ai: null;
    update_note: null;
    mark_message_as_modified: null;
    mark_message_as_rejected: null;
    trash_pdf_file: null;
    trash_bin: null;
    trash_bin_delete: null;
    trash_bin_restore: null;
    login: null;
    sign_up: null;
    create_profile: null;
    get_notes: null;
    get_profile: null;
    export_summary: null;
    global_search: null;
    edit_profile: null;
    log_out: null;
    delete_note: null;
  };
  registerAuthErrorHandler: (handler: () => void) => void;
  executeApiCall: (
    type: string,
    apiCall: () => Promise<any>,
    {
      onSuccess,
      onError,
      startLoading,
      endLoading,
    }?: {
      onSuccess?: (data: any) => void;
      onError?: (data: any) => void;
      startLoading?: boolean;
      endLoading?: boolean;
    },
  ) => void;
}
export const ApiContext = createContext<ApiInterface>({
  registerAuthErrorHandler: () => {},
  executeApiCall: () => {},
  loading: {
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
  },
  error: {
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
  },
});
export const useApi = () => {
  const context = useContext(ApiContext);
  return context;
};

export const ApiContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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
  const [authErrorHandler, setAuthErrorHandler] = useState<() => void>(
    () => {},
  );

  const registerAuthErrorHandler = (handler: () => void) => {
    setAuthErrorHandler(() => handler);
  };

  const navigate = useNavigate();
  const executeApiCall = async (
    type: string,
    apiCall: () => Promise<any>,
    {
      onSuccess = (_arg: any) => {},
      onError = (_arg: any) => {},
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
    } catch (error: any) {
      setError((prev) => ({ ...prev, [type]: error }));
      if (error.status === 403) {
        await authErrorHandler();
        navigate("/login");
      }
      if (onError) onError(error);

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
    <ApiContext.Provider
      value={{
        executeApiCall,
        error,
        loading,
        registerAuthErrorHandler,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};
export default ApiContextProvider;
