import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotes } from "@/contexts/NotesContext";
import { apiCalls } from "@/services/api";
import { toast } from "sonner";

export const useAiNotesFeatures = ({
  setActiveSidebar,
  selectionData,
  setSelectionData,
  setAiMessages,
  pdfId,
}) => {
  const { notesArray, setNotesArray } = useNotes();
  const { executeApiCall } = useApi();
  const { session } = useAuth();

  const onAskAi = async (type) => {
    if (!selectionData) return;
    const currentSelection = selectionData;
    setActiveSidebar("AI");
    let promptMessage = "";
    const staticSelectionData = {
      document_id: pdfId,
      text: selectionData.text,
      position: {
        page: selectionData.pageNum,
        x: selectionData.textX,
        y: selectionData.textY,
        width: selectionData.textWidth,
        height: selectionData.textHeight,
      },
      isSaved: false,
      isRejected: false,
      isModified: false,
    };
    if (type === "explain") {
      promptMessage = "Spiegami questo passaggio del documento";
    }
    if (type === "simplify") {
      promptMessage = "Semplifica questo passaggio del documento";
    }
    if (type === "example") {
      promptMessage = "Fammi un esempio di questo passaggio del documento";
    }
    const tempId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(7);
    const message = {
      role: "user",
      message_id: tempId,
      content: promptMessage + ":\n" + `${currentSelection.text}`,
      selection_data: staticSelectionData,
    };
    setAiMessages((prevMessages) => [...prevMessages, message]);
    await executeApiCall(
      "ask_ai",
      () => {
        return apiCalls.ai.askAi(
          session?.access_token,
          pdfId,
          message.content,
          {
            history: null,
            isExplaining: type === "explain",
            isSimplify: type === "simplify",
            isExample: type === "example",
            selection_data: staticSelectionData,
            notes: notesArray,
          },
        );
      },
      {
        onSuccess: (data) => {
          const aiResponseId =
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : Math.random().toString(36).substring(7);
          setAiMessages((prev) => {
            return [
              ...prev,
              {
                role: "assistant",
                message_id: aiResponseId,
                content: data.response,
                selection_data: message.selection_data,
              },
            ];
          });
        },
        onError: (error) => {
          toast.error(error?.message);
        },
      },
    );

    window.getSelection()?.removeAllRanges();
    setSelectionData(null);
  };

  const parseSelectionData = (raw: any) => {
    if (!raw) return null;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return { ...raw }; // clona, non muta il riferimento originale
  };

  const serializeSelectionData = (original: any, updated: any) => {
    return typeof original === "string" ? JSON.stringify(updated) : updated;
  };

  const onSaveAsNote = async (
    messageId: string,
    selection_data: any,
    content: string,
  ) => {
    if (!selection_data) return;
    const rawPage = selection_data.pageNum || selection_data.position?.page;
    const rawX =
      selection_data.textX !== undefined
        ? selection_data.textX
        : selection_data.position?.x;
    const rawY =
      selection_data.textY !== undefined
        ? selection_data.textY
        : selection_data.position?.y;
    const rawWidth =
      selection_data.textWidth !== undefined
        ? selection_data.textWidth
        : selection_data.position?.width;
    const rawHeight =
      selection_data.textHeight !== undefined
        ? selection_data.textHeight
        : selection_data.position?.height;

    const page = Number(rawPage || 0);
    const x = parseFloat(rawX);
    const y = parseFloat(rawY);
    const width = parseFloat(rawWidth);
    const height = parseFloat(rawHeight);

    const tempId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(7);

    const note = {
      note_id: tempId,
      document_id: pdfId,
      type: "NOTE",
      text: selection_data.text,
      content: content,
      position: { page, x, y, width, height },
    };

    const previousNotes = [...notesArray];
    setNotesArray([...notesArray, note]);
    window.getSelection()?.removeAllRanges();
    setSelectionData(null);

    const updateMessageSavedStatus = (saved: boolean) => {
      setAiMessages((prev) =>
        prev.map((msg) => {
          if (msg.message_id !== messageId) return msg;
          const parsedSd = parseSelectionData(msg.selection_data);
          if (!parsedSd) return msg;
          const updatedSd = { ...parsedSd, isSaved: saved };
          return {
            ...msg,
            selection_data: serializeSelectionData(
              msg.selection_data,
              updatedSd,
            ),
          };
        }),
      );
    };

    try {
      await executeApiCall(
        "save_note",
        () => apiCalls.notes.SaveNoteToDB(session?.access_token, pdfId, note),
        {
          onSuccess: (noteData) => {
            toast.success("Nota salvata e collegata alla chat!");
            setNotesArray((prev) =>
              prev.map((n) =>
                n === note ? { ...n, note_id: noteData?.note_id || tempId } : n,
              ),
            );
          },
          onError: (error) => {
            setNotesArray(previousNotes);
            toast.error(error?.message);
          },
        },
      );

      await executeApiCall(
        "mark_messages_as_saved",
        () =>
          apiCalls.ai.markMessagesAsSaved(
            session?.access_token,
            pdfId,
            selection_data.text,
          ),
        {
          onSuccess: () => updateMessageSavedStatus(true),
          onError: (err) =>
        },
      );
    } catch (err) {
      setNotesArray(previousNotes);
      updateMessageSavedStatus(false);
      toast.error(err?.message || "Impossibile salvare la nota nel database.", {
        action: {
          label: "Riprova",
          onClick: () => onSaveAsNote(messageId, selection_data, content),
        },
      });
    }
  };

  const onUpdateNote = async (
    messageId: string,
    noteId: string,
    newContent: string,
  ) => {
    const targetNote = notesArray.find((n) => n.note_id === noteId);
    const selectionText = targetNote?.text;
    const previousNotes = [...notesArray];
    setNotesArray(
      notesArray.map((n) =>
        n.note_id === noteId ? { ...n, content: newContent } : n,
      ),
    );

    const applyMessageState = (isSaved: boolean, isModified: boolean) => {
      setAiMessages((prev) =>
        prev.map((msg) => {
          const matchById = msg.message_id && msg.message_id === messageId;
          const parsedSd = parseSelectionData(msg.selection_data);
          const matchByText =
            selectionText && parsedSd && parsedSd.text === selectionText;

          if (!matchById && !matchByText) return msg;

          const baseSd = parsedSd || {
            text: selectionText,
            isSaved: false,
            isModified: false,
            isRejected: false,
          };
          const updatedSd = { ...baseSd, isSaved, isModified };

          return {
            ...msg,
            selection_data: serializeSelectionData(
              msg.selection_data,
              updatedSd,
            ),
          };
        }),
      );
    };
    try {
      await executeApiCall(
        "update_note",
        () =>
          apiCalls.notes.UpdateNoteInDB(
            session?.access_token,
            pdfId,
            noteId,
            newContent,
          ),
        {
          onSuccess: () => {},
          onError: (err) => {
            throw err;
          },
        },
      );

      if (selectionText) {
        await executeApiCall(
          "mark_message_as_modified",
          () =>
            apiCalls.ai.markMessageAsModified(
              session?.access_token,
              pdfId,
              selectionText,
            ),
          {
            onSuccess: () => {
              applyMessageState(true, true);
              toast.success("Nota modificata e sincronizzata!");
            },
            onError: (err) => {
              throw err;
            },
          },
        );
      } else {
        applyMessageState(true, true);
      }
    } catch (error) {
      setNotesArray(previousNotes);
      applyMessageState(true, false);
      toast.error(error?.message || "Impossibile salvare la nota. Riprova.", {
        action: {
          label: "Riprova",
          onClick: () => onUpdateNote(messageId, noteId, newContent),
        },
      });
    }
  };
  const onReject = async (messageId: string, selectionText: string) => {
    await executeApiCall(
      "mark_message_as_rejected",
      () =>
        apiCalls.ai.markMessageAsRejected(
          session?.access_token,
          pdfId,
          selectionText,
        ),
      {
        onSuccess: () => {
          setAiMessages((prev) =>
            prev.map((msg) => {
              // Match per message_id O per testo della selezione
              const matchById = msg.message_id && msg.message_id === messageId;
              const parsedSd = parseSelectionData(msg.selection_data);
              const matchByText = parsedSd && parsedSd.text === selectionText;

              if (!matchById && !matchByText) return msg;
              const baseSd = parsedSd || {
                text: selectionText,
                isSaved: false,
                isModified: false,
                isRejected: false,
              };
              const updatedSd = { ...baseSd, isRejected: true };

              return {
                ...msg,
                selection_data: serializeSelectionData(
                  msg.selection_data,
                  updatedSd,
                ),
              };
            }),
          );
          toast.success("Suggerimento scartato con successo!");
        },
        onError: (err) => {
          toast.error(err?.message || "Impossibile scartare il suggerimento.", {
            action: {
              label: "Riprova",
              onClick: () => onReject(messageId, selectionText),
            },
          });
        },
      },
    );
  };

  return {
    onReject,
    onUpdateNote,
    onSaveAsNote,
    onAskAi,
  };
};
