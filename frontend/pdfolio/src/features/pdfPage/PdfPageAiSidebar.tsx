import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CrossIcon from "@/icons/CrossIcon";
import { useParams } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { apiCalls } from "@/services/api";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw"; // <-- IMPORTA IL PLUGIN REHYPE
import AIMessage from "../ai/AIMessage";

const PdfPageAiSidebar = ({
  toggleAiSidebar,
  messages,
  setMessages,
  onSaveAsNote,
}: {
  toggleAiSidebar: () => void;
  messages: any[];
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  onSaveAsNote: (selection_data: any, content: string) => Promise<void>;
}) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();
  const { pdfId } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handleSendAi = async () => {
    if (!session || !pdfId || currentMessage === "") return;
    setIsLoading(true);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "user",
        content: currentMessage,
        selection_data: null,
      },
    ]);
    setCurrentMessage("");
    const { data, error } = await apiCalls.ai.askAi(
      session.access_token,
      pdfId,
      currentMessage,
      {
        history: messages.slice(messages.length - 4),
        isExplaining: false,
        selection_data: null,
      },
    );
    setMessages((prev) => {
      return [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          selection_data: null,
        },
      ];
    });
    setCurrentMessage("");
    setIsLoading(false);
    console.log(data, error);
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
      className="h-full bg-neutral-1 shadow-[-4px_0_15px_rgba(0,0,0,0.03)] overflow-hidden border-l border-neutral-4 flex flex-col"
    >
      {/* 1. HEADER (Fisso) */}
      <div className="w-full flex flex-row justify-between items-center border-b border-neutral-4 px-6 py-4 shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-lg font-bold font-inter text-black">
            Assistente AI
          </h1>
        </div>
        <CrossIcon
          size={24}
          className="text-neutral-400 cursor-pointer hover:text-black transition-colors"
          onClick={toggleAiSidebar}
        />
      </div>

      {/* 2. CHAT MESSAGES AREA (Scrollabile) */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
        {messages.map((m) => {
          return <AIMessage m={m} onSaveAsNote={onSaveAsNote} />;
        })}
        {isLoading && (
          <div className="mr-auto bg-white border border-neutral-3 rounded-2xl px-4 py-3 text-xs text-neutral-400 font-inter shadow-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. INPUT COMPONENT (Fisso in fondo) */}
      <div className="p-4 border-t border-neutral-4 bg-white shrink-0">
        <div className="flex flex-row items-center gap-2 w-full border border-neutral-4 rounded-xl px-3 py-2 bg-neutral-1 focus-within:border-black focus-within:bg-white transition-all">
          <input
            className="font-inter text-sm text-black w-full bg-transparent focus:outline-none placeholder-neutral-400 py-1"
            type="text"
            placeholder="Fai una domanda sul documento..."
            value={currentMessage}
            disabled={isLoading}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendAi();
            }}
          />
          <button
            className={`font-inter text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
              currentMessage.trim() === "" || isLoading
                ? "bg-neutral-3 text-neutral-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-neutral-800 cursor-pointer shadow-sm"
            }`}
            onClick={handleSendAi}
            disabled={currentMessage.trim() === "" || isLoading}
          >
            Invia
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PdfPageAiSidebar;
