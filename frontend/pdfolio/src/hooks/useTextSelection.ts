import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotes } from "@/contexts/NotesContext";
import { apiCalls } from "@/services/api";
import { useState } from "react";
import { toast } from "sonner";

interface SelectionData {
  menuX: number;
  menuY: number;
  text: string;
  textX: number;
  textY: number;
  textWidth: number;
  textHeight: number;
  pageNum: number;
}

export const useTextSelection = ({
  pageNumber,
  scale,
  scrollContainerRef,
  pdfId,
  setActiveSidebar,
}) => {
  const [selectionData, setSelectionData] = useState<{
    menuX: number;
    menuY: number;
    text: string;
    textX: number;
    textY: number;
    textWidth: number;
    textHeight: number;
    pageNum: number;
  } | null>(null);

  const { setNotesArray, notesArray } = useNotes();
  const { executeApiCall } = useApi();
  const { session } = useAuth();
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const container = scrollContainerRef.current;
    if (
      !selection ||
      selection.isCollapsed ||
      !selection.toString().trim() ||
      !container
    ) {
      setSelectionData(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const menuX =
      rect.left - containerRect.left + rect.width / 2 + container.scrollLeft;
    const menuY = rect.top - containerRect.top + container.scrollTop - 10;

    let node = selection.anchorNode;
    let pageElement = null;
    let selectedPageNum = pageNumber;

    if (node) {
      if (node.nodeType === 3) node = node.parentNode;
      const pageDiv = (node as Element).closest('[id^="page-"]');
      if (pageDiv) {
        pageElement = pageDiv;
        selectedPageNum = parseInt(pageDiv.id.replace("page-", ""), 10);
      }
    }

    let textX = 0,
      textY = 0,
      textWidth = 0,
      textHeight = 0;

    if (pageElement) {
      const pageRect = pageElement.getBoundingClientRect();
      textX = (rect.left - pageRect.left) / scale;
      textY = (rect.top - pageRect.top) / scale;
      textWidth = rect.width / scale;
      textHeight = rect.height / scale;
    } else {
      textX = (rect.left - containerRect.left + container.scrollLeft) / scale;
      textY = (rect.top - containerRect.top + container.scrollTop) / scale;
      textWidth = rect.width / scale;
      textHeight = rect.height / scale;
    }

    setSelectionData({
      menuX,
      menuY,
      text: selection.toString(),
      textX,
      textY,
      textWidth,
      textHeight,
      pageNum: selectedPageNum,
    });
  };

  const handleUnderlineAction = async (color: string) => {
    if (!selectionData) return;
    const highlight: any = {
      document_id: pdfId,
      type: "HIGHLIGHT",
      content: "",
      text: selectionData.text,
      position: {
        page: selectionData.pageNum,
        x: selectionData.textX,
        y: selectionData.textY,
        width: selectionData.textWidth,
        height: selectionData.textHeight,
      },
      color,
    };
    const prevNotes = notesArray;
    setNotesArray((prev) => [...prev, highlight]);
    window.getSelection()?.removeAllRanges();
    setSelectionData(null);
    setActiveSidebar("NOTES");

    await executeApiCall(
      "save_note",
      () => {
        return apiCalls.notes.SaveNoteToDB(
          session?.access_token,
          pdfId as string,
          highlight,
        );
      },
      {
        onSuccess: (noteData) => {
          setNotesArray((prev) =>
            prev.map((n) =>
              n === highlight ? { ...n, note_id: noteData.noteId } : n,
            ),
          );
        },
        onError: (error) => {
          toast.error(error?.message);
          setNotesArray(prevNotes);
          window.getSelection()?.removeAllRanges();
          setActiveSidebar("");
        },
      },
    );
    setSelectionData(null);
  };

  const handleAddNoteAction = () => {
    if (!selectionData) return;
    const note = {
      document_id: pdfId,
      type: "NOTE",
      text: selectionData.text,
      content: "",
      position: {
        page: selectionData.pageNum,
        x: selectionData.textX,
        y: selectionData.textY,
        width: selectionData.textWidth,
        height: selectionData.textHeight,
      },
    };
    const newArray = [...notesArray, note];
    setNotesArray(newArray);
    window.getSelection()?.removeAllRanges();
    setSelectionData(null);
    setActiveSidebar("NOTES");
  };

  const handleCopyAction = async () => {
    if (!selectionData) return;
    try {
      await navigator.clipboard.writeText(selectionData.text);
    } catch (err) {}
    window.getSelection()?.removeAllRanges();
    setSelectionData(null);
  };

  return {
    selectionData,
    setSelectionData,
    handleTextSelection,
    handleCopyAction,
    handleAddNoteAction,
    handleUnderlineAction,
  };
};
