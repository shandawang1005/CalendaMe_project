import { useState, useEffect } from "react";

const ThemeToggleButton = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check the saved theme on initial render
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark-theme" : false;
  });

  useEffect(() => {
    // Apply the correct theme on initial render
    const currentTheme = isDarkMode ? "dark-theme" : "light-theme";
    document.body.className = currentTheme;
  }, [isDarkMode]);

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
