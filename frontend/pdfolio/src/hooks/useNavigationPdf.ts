import { useNotes } from "@/contexts/NotesContext";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
interface UsePdfNavigationProps {
  pdfId: string;
  session: any;
  notesArray: any[];
  getPdfData: () => Promise<any>;
  fetchNotes: (id: string) => void;
}
export const useNavigationPdf = ({
  pdfId,
  getPdfData,
}: UsePdfNavigationProps) => {
  const [searchParams] = useSearchParams();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const scale = 1.2;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { notesArray, fetchNotes } = useNotes();

  useEffect(() => {
    getPdfData();
    fetchNotes(pdfId);
  }, [pdfId]);

  // Gestione dei Deep Link (Parametri URL)
  useEffect(() => {
    if (!numPages) return;

    const pageParam = searchParams.get("page");
    const noteParam = searchParams.get("note");

    if (noteParam && notesArray.length > 0) {
      const targetNote = notesArray.find((n) => n.note_id === noteParam);
      if (targetNote?.position) {
        const timer = setTimeout(() => {
          scrollToNoteInPdf(targetNote.position);
        }, 450);
        return () => clearTimeout(timer);
      }
    }

    if (pageParam) {
      const pageNum = parseInt(pageParam, 10);
      if (pageNum >= 1 && pageNum <= numPages) {
        const timer = setTimeout(() => {
          scrollToPage(pageNum);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [numPages, notesArray, searchParams]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!numPages) return;
    const container = e.currentTarget;
    const targetLine = container.scrollTop + container.clientHeight / 3;

    for (let i = 1; i <= numPages; i++) {
      const el = document.getElementById(`page-${i}`);
      if (el) {
        const elTop = el.offsetTop;
        const elBottom = elTop + el.offsetHeight;

        if (targetLine >= elTop && targetLine <= elBottom) {
          setPageNumber(i);
          break;
        }
      }
    }
  };

  const scrollToPage = (pageNum: number) => {
    if (pageNum < 1 || pageNum > (numPages || 1)) return;
    setPageNumber(pageNum);
    const el = document.getElementById(`page-${pageNum}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToNoteInPdf = (notePosition: any) => {
    const el = document.getElementById(`page-${notePosition.page}`);
    if (el && scrollContainerRef.current) {
      const targetScrollTop = el.offsetTop + notePosition.y * scale - 40;
      scrollContainerRef.current.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });
      setPageNumber(notePosition.page);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setPageNumber(isNaN(val) ? 1 : val);
  };

  return {
    numPages,
    pageNumber,
    scale,
    scrollContainerRef,
    onDocumentLoadSuccess,
    handleScroll,
    scrollToPage,
    scrollToNoteInPdf,
    handleInputChange,
  };
};
