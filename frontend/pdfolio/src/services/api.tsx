import { supabase } from "../../config/db.js";

const API_BASE_URL = "http://localhost:3000";
export const apiCalls = {
  authService: {
    async signUp({ email, password, handle }) {
      try {
        const { data: selectData, error: selectError } = await supabase
          .from("profiles")
          .select("*")
          .eq("handle", handle);

        if (selectError) throw selectError;

        // 🔥 MODIFICA QUI: Lanciamo un errore vero invece di fare il return
        if (selectData && selectData.length > 0) {
          throw { message: "L'handle è già registrato da un altro utente" };
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        // Se tutto va bene, ritorniamo i dati. executeApiCall leggerà questo in 'result.data'
        return { data, error: null };
      } catch (err) {
        throw err;
      }
    },
    async loginUser({ email, password }) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error, data: null };
      return { data, error: null };
    },
    async logOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { data: null, error: null };
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
      try {
        const response = await fetch(`${API_BASE_URL}/api/documents/getall`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
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
          const errorData = await response.json();
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
      }
    },
  },
  pdf: {
    async getPdfFile(session, documentId: string) {
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
          const errorData = await response.json();
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
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
          const errorData = await response.json();
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
      }
    },
    async trashPdfFile(session, documentId) {
      try {
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
          const errorData = await response.json();
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
      }
    },
    async deletePdfFile(session, documentId) {
      try {
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
          const errorData = await response.json();
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
      }
    },
    async restorePdfFile(session, documentId) {
      try {
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
          const errorData = await response.json();
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
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
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
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
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
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
          throw errorData;
        }
        const blob = await response.blob();
        return { data: blob, error: null };
      } catch (err) {
        throw err;
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
          const errorData = await response.json();
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
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
          const errorData = await response.json();
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
      }
    },
  },
  notes: {
    async getNotesByDocumentId(session, documentId: string) {
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
          const errorData = await response.json();
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
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
          const errorData = await response.json();
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
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
          const errorData = await response.json();
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
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
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
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
        if (!response.ok) {
          const errorData = await response.json();
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
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
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
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
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
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
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
      }
    },
  },
  profile: {
    async getProfile(session) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
      }
    },
    async editProfile(session, editedData) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/edit`, {
          method: "POST",
          body: JSON.stringify(editedData),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw errorData;
        }
        const { data } = await response.json();
        return { data, error: null };
      } catch (err) {
        throw err;
      }
    },
  },
};
