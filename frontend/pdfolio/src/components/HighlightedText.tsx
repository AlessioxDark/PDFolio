import React from "react";

const HighlightedText = ({ text, query }: { text: string; query: string }) => {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  const matchIndex = textLower.indexOf(queryLower);

  let displayText = text;
  let prefix = "";
  let suffix = "";

  if (matchIndex !== -1) {
    const start = Math.max(0, matchIndex - 60);
    const end = Math.min(text.length, matchIndex + query.length + 80);
    displayText = text.substring(start, end);
    if (start > 0) prefix = "...";
    if (end < text.length) suffix = "...";
  } else {
    if (text.length > 140) {
      displayText = text.substring(0, 140);
      suffix = "...";
    }
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = displayText.split(regex);

  return (
    <span className="text-neutral-700 leading-relaxed font-medium">
      {prefix}
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-[#FDE047]/40 text-black font-semibold px-1 py-0.5 rounded-[3px] shadow-2xs"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
      {suffix}
    </span>
  );
};

export default HighlightedText;
