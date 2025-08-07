// hooks/useApiService.js
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/adminService";
// import { userService } from "../services/userService";
import { authService } from "../services/authService";

export const useApiService = () => {
  const { user } = useAuth();

  // Return services based on user role
  if (!user) {
    return {
      auth: authService,
      isAdmin: false,
      isUser: false,
      role: null,
    };
  }

  if (user.role === "admin") {
    return {
      auth: authService,
      admin: adminService,
      isAdmin: true,
      isUser: false,
      role: "admin",
    };
  }

  // if (user.role === "user") {
  //   return {
  //     auth: authService,
  //     user: userService,
  //     isAdmin: false,
  //     isUser: true,
  //     role: "user",
  //   };
  // }

  return {
    auth: authService,
    isAdmin: false,
    isUser: false,
    role: user.role || null,
  };
};
