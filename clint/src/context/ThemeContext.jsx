import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  // Apply theme to DOM when isDarkMode changes
  useEffect(() => {
    console.log("Applying theme - isDarkMode:", isDarkMode);
    const html = document.documentElement;
    
    if (isDarkMode) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      console.log("HTML element classes:", html.className);
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      console.log("HTML element classes:", html.className);
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    console.log("Toggle button clicked!");
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
