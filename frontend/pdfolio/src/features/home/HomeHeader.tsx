import React from "react";

const HomeHeader = () => {
  return (
    <header className="sticky bg-neutral-2 z-10 dark:bg-zinc-900 top-0 px-3 py-4 flex flex-row gap-4 items-center border-b border-b-neutral-4 dark:border-b-zinc-800 items-center">
      <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/30 ">
        <span className="text-2xl font-bold text-white">P</span>
      </div>{" "}
      <span className="font-extrabold text-3xl text-accent">PDFolio</span>
    </header>
  );
};

export default HomeHeader;
