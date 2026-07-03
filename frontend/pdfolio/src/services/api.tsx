import { supabase } from "../../config/db.js";

const API_BASE_URL = "http://localhost:3000";
export const apiCalls = {
  authService: {
    async signUp({ email, password, handle }) {
      try {
        const { data: selectData, error: selectError } = await supabase
          .from("utenti")
          .select("*")
          .eq("handle", handle);
        if (selectError) throw selectError;
        if (selectData.length > 0) {
          return { data: null, error: { message: "Utente già registrato" } };
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    async loginUser({ email, password }) {
      console.log("email", email);
      console.log("password", password);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error, data: null };
      return { data, error: null };
    },

    async getSession() {
      return await supabase.auth.getSession();
    },
  },
  userService: {
    async createProfile(userData: {
      user_id: string;
      email: string;
      full_name: string;
      handle: string;
    }) {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        // Gestisci l'errore se il backend fallisce
        const errorData = await response.json();
        return { data: null, error: errorData.details || errorData.message };
      }
      return { data: await response.json(), error: null };
    },
  },
  home: {
    async getHomeFoldersAndFiles(session) {
      console.log("oi");
      try {
        const response = await fetch(`${API_BASE_URL}/api/documents/getall`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!response.ok) {
          // Gestisci l'errore se il backend fallisce
          const errorData = await response.json();
          return { data: null, error: errorData.details || errorData.message };
        }
        const { data } = await response.json();
        console.log("data in api", data);
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    async globalSearch(token, query) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/search/global?q=${query}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) {
          // Gestisci l'errore se il backend fallisce
          const errorData = await response.json();
          return { data: null, error: errorData.details || errorData.message };
        }
        const { data } = await response.json();
        console.log("data in api", data);
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
  },
  pdf: {
    async getPdfFile(session, documentId: string) {
      console.log("Documet", documentId);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/documents/${documentId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );
        if (!response.ok) {
          // Gestisci l'errore se il backend fallisce
          const errorData = await response.json();
          return { data: null, error: errorData.details || errorData.message };
        }
        const { data } = await response.json();
        console.log("data in api", data);
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    async uploadPdfFile(token, pdfFile) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: pdfFile,
        });
        if (!response.ok) {
          console.log("no ok", response);
          // Gestisci l'errore se il backend fallisce
          const errorData = await response.json();
          return {
            data: null,
            error: { message: errorData.details || errorData.message },
          };
        }
        const { data } = await response.json();
        console.log("data in api", data);
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    async trashPdfFile(session, documentId) {
      try {
        console.log("faccio richiesta");
        const response = await fetch(
          `${API_BASE_URL}/api/documents/${documentId}/trash`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );
        if (!response.ok) {
          console.log("no ok", response);
          // Gestisci l'errore se il backend fallisce
          const errorData = await response.json();
          return {
            data: null,
            error: { message: errorData.details || errorData.message },
          };
        }
        const { data } = await response.json();
        console.log("data in api", data);
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    async deletePdfFile(session, documentId) {
      try {
        console.log("faccio richiesta");
        const response = await fetch(
          `${API_BASE_URL}/api/documents/${documentId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );
        if (!response.ok) {
          console.log("no ok", response);
          // Gestisci l'errore se il backend fallisce
          const errorData = await response.json();
          return {
            data: null,
            error: { message: errorData.details || errorData.message },
          };
        }
        const { data } = await response.json();
        console.log("data in api", data);
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    async restorePdfFile(session, documentId) {
      try {
        console.log("faccio richiesta");
        const response = await fetch(
          `${API_BASE_URL}/api/documents/${documentId}/restore`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );
        if (!response.ok) {
          console.log("no ok", response);
          // Gestisci l'errore se il backend fallisce
          const errorData = await response.json();
          return {
            data: null,
            error: { message: errorData.details || errorData.message },
          };
        }
        const { data } = await response.json();
        console.log("data in api", data);
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    async updatePdf(session, documentId, updateData) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/documents/${documentId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify(updateData),
          },
        );
        if (!response.ok) {
          const errorData = await response.json();
          return {
            data: null,
            error: { message: errorData.message || errorData.details },
          };
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    async getDeletedDocuments(session) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/documents/deleted`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          return {
            data: null,
            error: { message: errorData.message || errorData.details },
          };
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    async exportSummaryPdf(token, documentId: string, markdownContent) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/documents/${documentId}/summary/pdf`,
          {
            method: "POST",
            body: JSON.stringify({ markdownContent }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) {
          const errorData = await response.json();
          return { data: null, error: errorData.details || errorData.message };
        }
        const blob = await response.blob();
        return { data: blob, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
  },
  folder: {
    async createFolder(session, folderData: object) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/folders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(folderData),
        });
        if (!response.ok) {
          // Gestisci l'errore se il backend fallisce
          const errorData = await response.json();
          return { data: null, error: errorData.details || errorData.message };
        }
        const { data } = await response.json();
        console.log("data in api", data);
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    async deleteFolder(session, folderId: string) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/folders/${folderId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );
        if (!response.ok) {
          console.log("no ok", response);
          // Gestisci l'errore se il backend fallisce
          const errorData = await response.json();
          return {
            data: null,
            error: { message: errorData.details || errorData.message },
          };
        }
        const { data } = await response.json();
        console.log("data in api", data);
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
  },
  notes: {
    async getNotesByDocumentId(session, documentId: string) {
      console.log("Documet", documentId);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/documents/${documentId}/notes`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );
        if (!response.ok) {
          // Gestisci l'errore se il backend fallisce
          const errorData = await response.json();
          return { data: null, error: errorData.details || errorData.message };
        }
        const { data } = await response.json();
        console.log("data in api", data);
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    async SaveNoteToDB(token, documentId: string, noteData) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/documents/${documentId}/notes`,
          {
            method: "POST",
            body: JSON.stringify({ noteData }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) {
          // Gestisci l'errore se il backend fallisce
          const errorData = await response.json();
          return { data: null, error: errorData.details || errorData.message };
        }
        const { data } = await response.json();
        console.log("data in api", data);
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    async deleteNoteFromDB(session, documentId: string, noteId) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/documents/${documentId}/notes/${noteId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );
        if (!response.ok) {
          // Gestisci l'errore se il backend fallisce
          const errorData = await response.json();
          return { data: null, error: errorData.details || errorData.message };
        }
        const { data } = await response.json();
        console.log("data in api", data);
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    async UpdateNoteInDB(
      session,
      documentId: string,
      noteId: string,
      updatedContent: string,
    ) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/documents/${documentId}/notes/${noteId}`,
          {
            method: "PATCH",
            body: JSON.stringify({ updatedContent }), // Inviamo solo il testo aggiornato
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
          },
        );
        if (!response.ok) {
          const errorData = await response.json();
          return { data: null, error: errorData.message };
        }
        return { data: await response.json(), error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
  },
  ai: {
    async askAi(
      token,
      documentId: string,
      prompt: string,
      context: {
        history: any[];
        isExplaining: boolean;
        selection_data: any;
      },
    ) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/ai/ask/${documentId}`,
          {
            method: "POST",
            body: JSON.stringify({ prompt, ...context }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        console.log("inviata ai");
        if (!response.ok) {
          // Gestisci l'errore se il backend fallisce
          const errorData = await response.json();
          return { data: null, error: errorData.details || errorData.message };
        }
        const { data } = await response.json();
        console.log("data in api", data);
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    async markMessagesAsSaved(
      token,
      documentId: string,
      selectionText: string,
    ) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/ai/messages/${documentId}/mark-saved`,
          {
            method: "PATCH",
            body: JSON.stringify({ selectionText }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) {
          const errorData = await response.json();
          return { data: null, error: errorData.details || errorData.message };
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    async markMessageAsModified(
      token,
      documentId: string,
      selectionText: string,
    ) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/ai/messages/${documentId}/mark-modified`,
          {
            method: "PATCH",
            body: JSON.stringify({ selectionText }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) {
          const errorData = await response.json();
          return { data: null, error: errorData.details || errorData.message };
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    async markMessageAsRejected(
      token,
      documentId: string,
      selectionText: string,
    ) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/ai/messages/${documentId}/mark-rejected`,
          {
            method: "PATCH",
            body: JSON.stringify({ selectionText }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) {
          const errorData = await response.json();
          return { data: null, error: errorData.details || errorData.message };
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
  },
  profile: {
    async getProfile(session) {
      try {
        console.log(session);
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          return {
            data: null,
            error: errorData.details || errorData.message,
          };
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
  },
};
