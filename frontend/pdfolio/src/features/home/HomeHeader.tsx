import React from "react";

const HomeHeader = () => {
  return (
    <header className="sticky bg-neutral-2 z-10 top-0 px-3 py-4 flex flex-row gap-4 items-center border-b border-b-neutral-4 dark:border-b-zinc-800">
      <img src="https://placehold.co/50x50" alt="PDFolio logo" />
      <span className="font-extrabold text-3xl text-accent">PDFolio</span>
    </header>
  );
};

export default HomeHeader;
