import React from "react";

const LoadingState = ({ size = "md", text }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full h-full py-6 select-none animate-fadeIn">
      <div className={`${sizeClasses[size]}`}>
        <svg
          viewBox="0 0 50 50"
          className="w-full h-full animate-loader-rotate"
        >
          {/* Binario di sfondo neutro */}
          <circle
            cx="25"
            cy="25"
            r="20.0535"
            fill="none"
            className="stroke-neutral-100 dark:stroke-zinc-900"
            strokeWidth="5.5"
          />

          {/* LINEA CHIARA — resta dietro, insegue la scura */}
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            pathLength="100"
            strokeDasharray="25 1000"
            className="stroke-purple-300 dark:stroke-purple-400/40 animate-step-chase-light [transform-origin:center]"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* LINEA SCURA */}
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            pathLength="100"
            strokeDasharray="25 1000"
            className="stroke-accent dark:stroke-purple-500 animate-step-chase-dark [transform-origin:center]"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {text && (
        <span className="font-inter text-[11px] font-bold tracking-wider text-neutral-400 dark:text-zinc-500 uppercase animate-pulse [animation-duration:2s]">
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingState;
