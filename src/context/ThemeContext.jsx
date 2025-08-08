// context/ThemeContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext"; // Import your auth context

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth(); // Get user from auth context

  const [theme, setTheme] = useState(() => {
    // If user is admin, always return light and clear any dark mode
    if (user?.role === "admin") {
      localStorage.setItem("theme", "light");
      // Immediately remove dark class if it exists
      if (typeof window !== "undefined") {
        window.document.documentElement.classList.remove("dark");
      }
      return "light";
    }

    // For non-admin users, check localStorage first, then system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }

    // Check system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    return "light";
  });

  // Effect to handle user role changes (login/logout scenarios)
  useEffect(() => {
    if (user?.role === "admin") {
      // Force light mode for admin users
      setTheme("light");
      localStorage.setItem("theme", "light");
      const root = window.document.documentElement;
      root.classList.remove("dark");
    }
  }, [user?.role]); // Trigger when user role changes

  // Effect to handle theme changes
  useEffect(() => {
    const root = window.document.documentElement;

    // Always remove dark class first
    root.classList.remove("dark");

    // Only add dark class if theme is dark AND user is not admin
    if (theme === "dark" && user?.role !== "admin") {
      root.classList.add("dark");
    }

    // Save to localStorage (admins will always have 'light' saved)
    localStorage.setItem("theme", theme);
  }, [theme, user?.role]);

  // Listen for system theme changes only for non-admin users
  useEffect(() => {
    if (user?.role === "admin") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      const savedTheme = localStorage.getItem("theme");
      if (!savedTheme) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [user?.role]);

  const toggleTheme = () => {
    // Prevent theme toggle for admin users
    if (user?.role === "admin") {
      console.log("Theme switching is disabled for admin users");
      return;
    }
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setLightTheme = () => {
    if (user?.role === "admin") return;
    setTheme("light");
  };

  const setDarkTheme = () => {
    if (user?.role === "admin") return;
    setTheme("dark");
  };

  const value = {
    theme: user?.role === "admin" ? "light" : theme, // Always return 'light' for admins
    setTheme: user?.role === "admin" ? () => {} : setTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    isDark: user?.role === "admin" ? false : theme === "dark", // Always false for admins
    isLight: user?.role === "admin" ? true : theme === "light", // Always true for admins
    canChangeTheme: user?.role !== "admin", // Helper to check if theme can be changed
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
