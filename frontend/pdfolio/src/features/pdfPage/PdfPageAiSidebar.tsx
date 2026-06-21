import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CrossIcon from "@/icons/CrossIcon";
import { useParams } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { apiCalls } from "@/services/api";
import Markdown from "react-markdown";
const PdfPageAiSidebar = ({
  toggleAiSidebar,
  messages,
  setMessages,
}: {
  toggleAiSidebar: () => void;
  messages: any[];
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
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
      { role: "user", content: currentMessage },
    ]);
    setCurrentMessage("");
    const { data, error } = await apiCalls.ai.askAi(
      session.access_token,
      pdfId,
      currentMessage,
    );
    setMessages((prev) => {
      return [...prev, { role: "assistant", content: data.response }];
    });
    setCurrentMessage("");
    setIsLoading(false);
    console.log(data, error);
  };

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
        {messages.map((m, index) => {
          const isUser = m.role === "user";
          return (
            <div
              key={index}
              className={`max-w-[85%] flex flex-col rounded-2xl px-4 py-3 border font-inter text-sm leading-relaxed ${
                isUser
                  ? "ml-auto bg-black border-black text-white shadow-sm"
                  : "mr-auto bg-white border-neutral-3 text-black shadow-sm"
              }`}
            >
              <span
                className={`text-[10px] uppercase tracking-wider font-bold mb-1.5 block ${
                  isUser ? "text-neutral-400" : "text-neutral-500"
                }`}
              >
                {isUser ? "Tu" : "PDFolio Bot"}
              </span>

              <div
                className={`prose prose-sm max-w-none ${isUser ? "text-white" : "text-neutral-800"}`}
              >
                <Markdown
                  components={{
                    strong: ({ ...props }) => (
                      <strong
                        className={
                          isUser
                            ? "text-white font-bold"
                            : "text-black font-bold"
                        }
                        {...props}
                      />
                    ),
                    ul: ({ ...props }) => (
                      <ul className="list-disc pl-4 my-1.5" {...props} />
                    ),
                    ol: ({ ...props }) => (
                      <ol className="list-decimal pl-4 my-1.5" {...props} />
                    ),
                    li: ({ ...props }) => <li className="my-0.5" {...props} />,
                    p: ({ ...props }) => (
                      <p className="my-0 leading-relaxed" {...props} />
                    ),
                  }}
                >
                  {m.content}
                </Markdown>
              </div>
            </div>
          );
        })}

        {/* Indicatore di caricamento (Skeleton o testo) */}
        {isLoading && (
          <div className="mr-auto bg-white border border-neutral-3 rounded-2xl px-4 py-3 text-xs text-neutral-400 font-inter shadow-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
          </div>
        )}

        {/* Elemento di ancoraggio per l'autoscroll */}
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
