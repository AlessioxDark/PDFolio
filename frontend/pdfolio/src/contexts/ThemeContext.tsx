import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<{
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
  toggleTheme: () => void;
}>({
  currentTheme: "light",
  setCurrentTheme: (theme: string) => {},
  toggleTheme: () => {},
});
export const useTheme = () => {
  const context = useContext(ThemeContext);
  return context;
};

export const ThemeContextProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;

    if (currentTheme === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [currentTheme]);
  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === "light" ? "dark" : "light"));
  };
  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setCurrentTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
