import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProfile();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });
      const userData = response.data.user;
      setUser(userData);
      return {
        success: true,
        user: userData, // ✅ NEW: Return user data for immediate use
      };
    } catch (error) {
      let errorMessage = "An error occurred during login. Please try again.";

      if (error.response?.status === 401 || error.response?.status === 400) {
        errorMessage =
          "Invalid email or password. Please check your credentials and try again.";
      } else if (error.response?.status === 429) {
        errorMessage =
          "Too many login attempts. Please wait a few minutes before trying again.";
      } else if (error.response?.status === 403) {
        errorMessage =
          "Account access denied. Please contact your administrator.";
      } else if (error.response?.status >= 500) {
        errorMessage =
          "Server error. Please try again later or contact support.";
      } else if (error.message) {
        // Use the original error message if it exists
        errorMessage = error.message;
      }

      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const getProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get("/auth/me");
      console.log("Profile data:", response.data.user);
      setUser(response.data.user);
    } catch (error) {
      console.log(
        "Profile fetch failed:",
        error.response?.data?.message || error.message
      );
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError("");

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, login, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
