import React, { useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import CreateNoteMessage from "./aiCustomMessages/CreateNoteMessage";
import ModifyNoteMessage from "./aiCustomMessages/ModifyNoteMessage";
import SummaryPdfMessage from "./aiCustomMessages/SummaryPdfMessage";

const AIMessage = ({
  m,
  onSaveAsNote,
  onUpdateNote,
  onReject,
}: {
  m: any;
  onSaveAsNote: (
    messageId: string,
    selectionData: any,
    content: string,
  ) => Promise<void>;
  onUpdateNote: (
    messageId: string,
    noteId: string,
    content: string,
  ) => Promise<void>;
  onReject: (messageId: string, selectionText: string) => Promise<void>;
}) => {
  const isUser = m.role === "user";
  const [isUpdatingLocal, setIsUpdatingLocal] = useState(false);
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [isRejectingLocal, setIsRejectingLocal] = useState(false);

  const getParsedSelectionData = (raw: any) => {
    if (!raw) return null;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return { ...raw };
  };

  const extractText = (children: any): string => {
    if (typeof children === "string") return children;
    if (typeof children === "number") return String(children);
    if (Array.isArray(children)) return children.map(extractText).join("");
    if (children && children.props && children.props.children) {
      return extractText(children.props.children);
    }
    return "";
  };
  const selectionDataToUse = getParsedSelectionData(m.selection_data);

  return (
    <div
      key={m.message_id}
      className={`max-w-[85%] flex flex-col rounded-2xl px-4 py-3 border font-inter text-sm leading-relaxed transition-colors duration-200 ${
        isUser
          ? "ml-auto bg-black border-black text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-950 shadow-sm"
          : "mr-auto bg-white border-neutral-3 text-black dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 shadow-sm"
      }`}
    >
      <div
        className={`prose prose-sm max-w-none ${
          isUser
            ? "text-white dark:text-zinc-950"
            : "text-neutral-800 dark:text-zinc-200"
        } dark:prose-invert`}
      >
        <Markdown
          key={m.message_id}
          rehypePlugins={[rehypeRaw]}
          components={{
            strong: ({ ...props }) => (
              <strong
                className={
                  isUser
                    ? "text-white dark:text-zinc-950 font-bold"
                    : "text-black dark:text-white font-bold"
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

            "crea-nota": ({ node, children, ...props }: any) => {
              return (
                <CreateNoteMessage
                  onSaveAsNote={onSaveAsNote}
                  onReject={onReject}
                  extractedText={extractText(children)}
                  selectionDataToUse={selectionDataToUse}
                  m={m}
                  isSavingLocal={isSavingLocal}
                  setIsSavingLocal={setIsSavingLocal}
                  isRejectingLocal={isRejectingLocal}
                  setIsRejectingLocal={setIsRejectingLocal}
                />
              );
            },

            /* 📝 CUSTOM COMPONENT: MODIFICA / REVISIONE NOTA CORRENTE */
            "modifica-nota": ({ node, children, ...props }: any) => {
              return (
                <ModifyNoteMessage
                  isUpdatingLocal={isUpdatingLocal}
                  setIsUpdatingLocal={setIsUpdatingLocal}
                  isRejectingLocal={isRejectingLocal}
                  setIsRejectingLocal={setIsRejectingLocal}
                  onUpdateNote={onUpdateNote}
                  onReject={onReject}
                  extractedText={extractText(children)}
                  props={props}
                  selectionDataToUse={selectionDataToUse}
                  m={m}
                />
              );
            },

            "export-summary": ({ node, children, ...props }: any) => {
              return (
                <SummaryPdfMessage extractedText={extractText(children)} />
              );
            },
          }}
        >
          {m.content}
        </Markdown>
      </div>
    </div>
  );
};

export default AIMessage;
