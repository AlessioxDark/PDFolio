import React from "react";

const UnderlinedElement = ({
  sotto,
  pos,
  scale,
  scrollToNote,
}: {
  sotto: any;
  pos: any;
  scale: number;
  scrollToNote: (note: any) => void;
}) => {
  console.log("sotto", sotto);
  return (
    <div
      key={sotto.note_id || `${pos.page}-${pos.x}-${pos.y}`}
      style={{
        position: "absolute",
        left: `${pos.x * scale}px`,
        top: `${pos.y * scale}px`,
        width: `${pos.width * scale}px`,
        height: `${pos.height * scale}px`,
        backgroundColor:
          sotto.type === "HIGHLIGHT"
            ? // ? "rgba(253, 224, 71, 0.4)"
              sotto.color
            : "rgba(147, 51, 234, 0.3)",
        mixBlendMode: "multiply",
        cursor: "pointer",
        pointerEvents: "auto",
        zIndex: 10,
        transition: "all 0.2s",
      }}
      onClick={() => {
        scrollToNote(pos);
      }}
      onMouseEnter={(e) => (e.target.style.opacity = "0.8")}
      onMouseLeave={(e) => (e.target.style.opacity = "1")}
    />
  );
};

export default UnderlinedElement;
