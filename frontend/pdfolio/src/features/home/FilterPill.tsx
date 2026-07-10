import React, { useEffect, useState } from "react";

const FilterPill = ({
  label,
  isActive,
  setSelectedFilter,
}: {
  label: {
    name: string;
    options?: string[];
  };
  isActive: boolean;
  setSelectedFilter: React.Dispatch<
    React.SetStateAction<{
      name: string;
      options?: string[];
      // currentColor: string;
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
    <div className="relative">
      {" "}
      <div
        className={`px-4 py-2 rounded-2xl text-sm cursor-pointer font-inter transition-colors duration-200 ${
          isActive
            ? "text-accent bg-light-accent dark:bg-purple-950/40 dark:text-purple-400 font-bold"
            : "text-text-1 dark:text-zinc-400 bg-neutral-3 dark:bg-zinc-900 hover:bg-neutral-4 dark:hover:bg-zinc-800"
        }`}
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
        <div className="absolute top-full left-0 mt-2 grid grid-cols-3 bg-white dark:bg-zinc-950 border border-neutral-4 dark:border-zinc-800 p-1.5 rounded-xl shadow-lg z-50 gap-1 min-w-[120px]">
          {label?.options?.map((c, index) => {
            const isHex = c.startsWith("#");

            return (
              <div
                key={index}
                className="flex items-center justify-center p-1 rounded-lg hover:bg-neutral-2 dark:hover:bg-zinc-900 transition-colors"
              >
                <div
                  className={`w-5 h-5 rounded-full cursor-pointer transition-transform  shadow-sm ${!isHex ? c : ""}`}
                  style={{
                    backgroundColor: isHex ? c : undefined,
                  }}
                  onClick={() => {
                    // Se passi classi tipo "bg-yellow-300", prendi solo la tinta pura o l'hex estratto per il filtro logico
                    const colorValue = isHex ? c : c.replace("bg-", "");
                    console.log("click color:", colorValue);

                    setSelectedFilter((prev) => {
                      return { ...prev, currentColor: colorValue };
                    });
                    setIsDropDownOpen(false);
                  }}
                ></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  ) : (
    <div
      className={`px-4 py-2 rounded-2xl text-sm cursor-pointer font-inter transition-colors duration-200 ${
        isActive
          ? "text-accent bg-light-accent dark:bg-purple-950/40 dark:text-purple-400 font-bold"
          : "text-text-1 dark:text-zinc-400 bg-neutral-3 dark:bg-zinc-900 hover:bg-neutral-4 dark:hover:bg-zinc-800"
      }`}
      onClick={() => setSelectedFilter(label)}
    >
      {label.name}
    </div>
  );
};

export default FilterPill;
