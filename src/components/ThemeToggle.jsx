// components/ThemeToggle.jsx
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = ({ variant = "default" }) => {
  const { theme, toggleTheme } = useTheme();

  if (variant === "sidebar") {
    // Sidebar version - fits well in sidebar
    return (
      <button
        onClick={toggleTheme}
        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-250 text-primary-100 dark:text-dark-purple-200 hover:bg-primary-700 dark:hover:bg-dark-purple-700 hover:text-white"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <>
            <Moon size={18} className="flex-shrink-0" />
            <span className="font-sans">Dark Mode</span>
          </>
        ) : (
          <>
            <Sun size={18} className="flex-shrink-0" />
            <span className="font-sans">Light Mode</span>
          </>
        )}
      </button>
    );
  }

  if (variant === "header") {
    // Header version - compact for top navigation
    return (
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg bg-gray-100 dark:bg-dark-bg-tertiary text-gray-800 dark:text-dark-purple-200 hover:bg-gray-200 dark:hover:bg-dark-purple-700 transition-all duration-250 shadow-sm"
        aria-label="Toggle theme"
      >
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    );
  }

  // Default version - standalone button
  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-600 dark:bg-dark-purple-500 text-white hover:bg-primary-700 dark:hover:bg-dark-purple-600 transition-all duration-250 shadow-md hover:shadow-lg font-medium"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <>
          <Moon size={18} />
          <span>Dark Mode</span>
        </>
      ) : (
        <>
          <Sun size={18} />
          <span>Light Mode</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
