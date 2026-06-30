import React, { useEffect, useState } from "react";

const FilterPill = ({
  label,
  isActive,
  setSelectedFilter,
}: {
  label: string;
  isActive: boolean;
  setSelectedFilter: React.Dispatch<
    React.SetStateAction<{
      name: string;
      currentColor: string;
    }>
  >;
}) => {
  const [isDropDownOpen, setIsDropDownOpen] = useState(isActive);

  useEffect(() => {
    if (!isActive) {
      setIsDropDownOpen(false);
    }
  }, [isActive]);
  return label.name == "Colore" ? (
    <>
      <div
        className={`px-4 py-2 rounded-2xl  text-sm cursor-pointer font-inter transition-colors  duration-200 ${isActive ? "text-accent bg-light-accent font-bold" : "text-text-1 bg-neutral-3 hover:bg-neutral-4"}`}
        onClick={() => {
          setIsDropDownOpen(!isDropDownOpen);
          setSelectedFilter((prev) => {
            if (prev.name == "Colore") {
              return prev;
            }
            return label;
          });
        }}
      >
        {label.name}
      </div>
      {isDropDownOpen && (
        <div className="absolute grid grid-cols-3">
          {label.options.map((c) => {
            return (
              <div className="w-max py-1.5 bg-neutral-1">
                <div
                  className={`${c} w-2 h-2 m-2 p-2 rounded-full cursor-pointer`}
                  onClick={() => {
                    console.log("click", c, c.slice(4, -1));
                    // setSelectedFilter(false);
                    setSelectedFilter((prev) => {
                      return { ...prev, currentColor: c.slice(4, -1) };
                    });
                    setIsDropDownOpen(false);
                  }}
                ></div>
              </div>
            );
          })}
        </div>
      )}
    </>
  ) : (
    <div
      className={`px-4 py-2 rounded-2xl  text-sm cursor-pointer font-inter transition-colors  duration-200 ${isActive ? "text-accent bg-light-accent font-bold" : "text-text-1 bg-neutral-3 hover:bg-neutral-4"}`}
      onClick={() => setSelectedFilter(label)}
    >
      {label.name}
    </div>
  );
};

export default FilterPill;
