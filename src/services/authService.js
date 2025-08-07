// services/authService.js
import api from "../utils/api";

export const authService = {
  // Login user
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Register user (if you have registration)
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // Refresh token (if using JWT)
  refreshToken: async () => {
    const response = await api.post("/auth/refresh");
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post("/auth/change-password", {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },

  // Verify email (if using email verification)
  verifyEmail: async (token) => {
    const response = await api.post("/auth/verify-email", { token });
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email) => {
    const response = await api.post("/auth/resend-verification", { email });
    return response.data;
  },
};
