import { useState } from "react";
import Sidebar from "./sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, LogOut, Bell } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // You can replace this with actual notifications from your API/context
  const [notifications] = useState([
    // Remove hardcoded data - you can fetch from API or context
    // { id: 1, message: "New message received", time: "2 min ago" },
    // { id: 2, message: "System update available", time: "1 hour ago" },
    // { id: 3, message: "Profile updated successfully", time: "3 hours ago" },
  ]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      // Force navigation even if logout API fails
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="h-screen overflow-hidden w-full bg-primary-50 dark:bg-dark-bg-primary flex transition-colors duration-250">
      {/* Sidebar */}
      <Sidebar />

      {/* Right column */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-dark-bg-secondary shadow-sm border-b border-primary-100 dark:border-dark-purple-700 px-6 py-4 transition-colors duration-250">
          <div className="flex items-center justify-between">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-600 dark:bg-dark-purple-500 rounded-full flex items-center justify-center shadow-md">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold font-display text-primary-800 dark:text-text-dark-primary">
                  {user?.name}
                </h2>
                <p className="text-sm font-sans text-primary-600 dark:text-dark-purple-300">
                  {user?.role === "admin" ? "Administrator" : "Student"}
                </p>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              {user?.role === "user" && <ThemeToggle variant="header" />}
              {/* Notifications */}
              <div className="relative group">
                <Bell
                  size={22}
                  className="text-primary-600 dark:text-dark-purple-300 cursor-pointer hover:text-primary-800 dark:hover:text-dark-purple-200 transition-colors"
                />

                {/* Show notification count only if there are notifications */}
                {notifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 dark:bg-red-600 text-white text-xs rounded-full flex items-center justify-center shadow-md">
                    {notifications.length}
                  </span>
                )}

                {/* Notification Dropdown */}
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg dark:shadow-dark border border-primary-100 dark:border-dark-purple-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4 border-b border-primary-100 dark:border-dark-purple-700">
                    <h3 className="font-semibold font-display text-primary-800 dark:text-text-dark-primary">
                      Notifications
                    </h3>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 border-b border-primary-50 dark:border-dark-purple-800 hover:bg-primary-25 dark:hover:bg-dark-purple-800 cursor-pointer transition-colors"
                        >
                          <p className="text-sm font-sans text-gray-800 dark:text-text-dark-primary">
                            {notification.message}
                          </p>
                          <p className="text-xs font-sans text-primary-600 dark:text-dark-purple-300 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-text-dark-tertiary text-sm font-sans">
                        No new notifications
                      </div>
                    )}
                  </div>

                  {/* Footer with Actions */}
                  <div className="p-4 border-t border-primary-100 dark:border-dark-purple-700 space-y-2">
                    {notifications.length > 0 && (
                      <button className="w-full text-center text-sm font-medium font-sans text-primary-600 dark:text-dark-purple-300 hover:text-primary-800 dark:hover:text-dark-purple-200 py-2 transition-colors">
                        View All Notifications
                      </button>
                    )}

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium font-sans shadow-md"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-dark-bg-primary transition-colors duration-250">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
