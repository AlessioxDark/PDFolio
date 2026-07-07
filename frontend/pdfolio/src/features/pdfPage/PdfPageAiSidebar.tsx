import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CrossIcon from "@/icons/CrossIcon";
import { useParams } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { apiCalls } from "@/services/api";

import AIMessage from "../ai/AIMessage";
import { useNotes } from "@/contexts/NotesContext";
import { useApi } from "@/contexts/ApiContext";

const PdfPageAiSidebar = ({
  toggleAiSidebar,
  messages,
  setMessages,
  onSaveAsNote,
  onUpdateNote,
  onReject,
}: {
  toggleAiSidebar: () => void;
  messages: any[];
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  onSaveAsNote: (
    messageId: string,
    selection_data: any,
    content: string,
  ) => Promise<void>;
  onUpdateNote: (
    messageId: string,
    noteId: string,
    content: string,
  ) => Promise<void>;
  onReject: (messageId: string, selectionText: string) => Promise<void>;
}) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const { session } = useAuth();
  const { pdfId } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { notesArray } = useNotes();
  const { loading, executeApiCall } = useApi();

  const handleSendAi = async () => {
    if (!session || !pdfId || currentMessage === "") return;
    const oldMessage = currentMessage;
    const oldMessagesData = messages;
    setCurrentMessage("");

    const userMsgId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(7);

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "user",
        message_id: userMsgId,
        content: currentMessage,
        selection_data: null,
      },
    ]);

    executeApiCall(
      "ask_ai",
      () => {
        return apiCalls.ai.askAi(session.access_token, pdfId, currentMessage, {
          history: messages.slice(messages.length - 4),
          isExplaining: false,
          isSimplify: false,
          isExample: false,
          selection_data: null,
          notes: notesArray,
        });
      },
      {
        onSuccess: (data) => {
          const assistantMsgId =
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : Math.random().toString(36).substring(7);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              message_id: assistantMsgId,
              content: data.response,
              selection_data: null,
            },
          ]);
        },
        onError: (error) => {
          setCurrentMessage(oldMessage);
          setMessages(oldMessagesData);
        },
      },
    );
  };
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);
  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 500, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full bg-neutral-1 dark:bg-zinc-950 shadow-[-4px_0_15px_rgba(0,0,0,0.03)] dark:shadow-[-8px_0_30px_rgba(0,0,0,0.3)] overflow-hidden border-l border-neutral-4 dark:border-zinc-800 flex flex-col transition-colors duration-300"
    >
      {/* 1. HEADER (Fisso) */}
      <div className="w-full flex flex-row justify-between items-center border-b border-neutral-4 dark:border-zinc-800 px-6 py-4 shrink-0 bg-white dark:bg-zinc-950 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-lg font-bold font-inter text-black dark:text-zinc-100">
            Assistente AI
          </h1>
        </div>
        <CrossIcon
          size={24}
          className="text-neutral-400 dark:text-zinc-500 cursor-pointer hover:text-black dark:hover:text-zinc-200 transition-colors"
          onClick={toggleAiSidebar}
        />
      </div>

      {/* 2. CHAT MESSAGES AREA (Scrollabile) */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4 bg-neutral-1 dark:bg-zinc-950/40">
        {messages.map((m) => {
          return (
            <AIMessage
              key={m.message_id}
              onUpdateNote={onUpdateNote}
              onReject={onReject}
              m={m}
              onSaveAsNote={onSaveAsNote}
            />
          );
        })}

        {/* Stato di caricamento (Tre pallini oscillanti) */}
        {loading?.ask_ai && (
          <div className="mr-auto bg-white dark:bg-zinc-900 border border-neutral-3 dark:border-zinc-800 rounded-2xl px-4 py-3 text-xs text-neutral-400 dark:text-zinc-500 font-inter shadow-sm flex items-center gap-2 transition-colors">
            <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-zinc-500 rounded-full animate-bounce"></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. INPUT COMPONENT (Fisso in fondo) */}
      <div className="p-4 border-t border-neutral-4 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 transition-colors duration-300">
        <div className="flex flex-row items-center gap-2 w-full border border-neutral-4 dark:border-zinc-800 rounded-xl px-3 py-2 bg-neutral-1 dark:bg-zinc-900 focus-within:border-black dark:focus-within:border-zinc-500 focus-within:bg-white dark:focus-within:bg-zinc-950 transition-all">
          <input
            className="font-inter text-sm text-black dark:text-zinc-100 w-full bg-transparent focus:outline-none placeholder-neutral-400 dark:placeholder-zinc-500 py-1"
            type="text"
            placeholder="Fai una domanda sul documento..."
            value={currentMessage}
            disabled={loading?.ask_ai}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendAi();
            }}
          />
          <button
            className={`font-inter text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
              currentMessage.trim() === "" || loading?.ask_ai
                ? "bg-neutral-3 dark:bg-zinc-800 text-neutral-400 dark:text-zinc-600 cursor-not-allowed"
                : "bg-black dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-neutral-800 dark:hover:bg-zinc-200 cursor-pointer shadow-sm"
            }`}
            onClick={handleSendAi}
            disabled={currentMessage.trim() === "" || loading?.ask_ai}
          >
            Invia
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PdfPageAiSidebar;
