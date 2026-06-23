import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const AIMessage = ({
  m,
  onSaveAsNote,
}: {
  m: any;
  onSaveAsNote: (selectionData: any, content: string) => Promise<void>;
}) => {
  const isUser = m.role === "user";

  const getParsedSelectionData = (msg: any) => {
    if (!msg || !msg.selection_data) return null;
    let data = msg.selection_data;
    if (typeof data === "string") {
      try {
        console.log("è json");
        data = JSON.parse(data);
      } catch (e) {
        console.error("Errore JSON.parse selection_data:", e);
        return null;
      }
    }
    return data;
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
  const selectionDataToUse = getParsedSelectionData(m);
  const [isSaved, setIsSaved] = useState<boolean>(
    !!selectionDataToUse?.isSaved,
  );

  // Resincronizza isSaved quando la prop m.selection_data cambia dall'esterno
  useEffect(() => {
    const sd = getParsedSelectionData(m);
    setIsSaved(!!sd?.isSaved);
  }, [m.selection_data]);
  return (
    <div
      key={m.message_id}
      className={`max-w-[85%] flex flex-col rounded-2xl px-4 py-3 border font-inter text-sm leading-relaxed ${
        isUser
          ? "ml-auto bg-black border-black text-white shadow-sm"
          : "mr-auto bg-white border-neutral-3 text-black shadow-sm"
      }`}
    >
      <div
        className={`prose prose-sm max-w-none ${isUser ? "text-white" : "text-neutral-800"}`}
      >
        <Markdown
          rehypePlugins={[rehypeRaw]}
          components={{
            strong: ({ ...props }) => (
              <strong
                className={
                  isUser ? "text-white font-bold" : "text-black font-bold"
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
              const page = props.page ? parseInt(props.page) : 1;

              return (
                <div className="my-3 p-4 border border-accent bg-light-accent rounded-xl flex flex-col gap-2 shadow-sm text-left">
                  <div className="text-black font-bold text-sm">
                    {selectionDataToUse?.text && selectionDataToUse.text}
                    <span className="text-neutral-500 font-normal text-xs">
                      (Pag. {page})
                    </span>
                  </div>

                  {/* Mostra il testo formattato internamente al box della nota */}

                  <div className="text-neutral-700 text-xs border-l-2 border-accent pl-3 py-1 bg-light-accent rounded-r-md">
                    <Markdown
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        // Customizziamo i paragrafi per non lasciare margini giganti dentro le note
                        p: ({ ...props }) => (
                          <p
                            className="my-0 leading-relaxed inline"
                            {...props}
                          />
                        ),
                        ul: ({ ...props }) => (
                          <ul className="list-disc pl-4 my-1" {...props} />
                        ),
                        ol: ({ ...props }) => (
                          <ol className="list-decimal pl-4 my-1" {...props} />
                        ),
                      }}
                    >
                      {extractText(children)}
                    </Markdown>
                  </div>

                  <button
                    onClick={async () => {
                      if (selectionDataToUse) {
                        const contentText = extractText(children);
                        await onSaveAsNote(selectionDataToUse, contentText);
                        setIsSaved(true);
                      }
                    }}
                    className="w-full mt-2 bg-accent hover:bg-accent/80 text-white font-medium text-xs py-2 px-3 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer font-inter disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-400"
                    disabled={isSaved}
                  >
                    {isSaved ? "Già salvata" : "Salva come nota"}
                  </button>
                </div>
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
