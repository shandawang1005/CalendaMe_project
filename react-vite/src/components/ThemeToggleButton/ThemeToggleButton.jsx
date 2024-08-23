import { useState, useEffect } from "react";

const ThemeToggleButton = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.body.className = savedTheme;
      setIsDarkMode(savedTheme === "dark-theme");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light-theme" : "dark-theme";
    document.body.className = newTheme;
    localStorage.setItem("theme", newTheme);
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button onClick={toggleTheme} className="theme-toggle-button">
      {isDarkMode ? "🌙" : "☀️"}
    </button>
  );
};

export default ThemeToggleButton;
