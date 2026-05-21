import React from "react";

const FilterPill = ({
  label,
  isActive,
}: {
  label: string;
  isActive: boolean;
}) => {
  return (
    <div
      className={`px-4 py-2 rounded-2xl  text-sm cursor-pointer font-inter transition-colors  duration-200 ${isActive ? "text-accent bg-light-accent font-bold" : "text-text-1 bg-neutral-3 hover:bg-neutral-4"}`}
    >
      {label}
    </div>
  );
};

export default FilterPill;
