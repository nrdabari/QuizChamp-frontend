import { useState } from "react";
import Sidebar from "./sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, LogOut, Bell } from "lucide-react";

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
    <div className="h-screen overflow-hidden w-[100%] bg-purple-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Right column */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm border-b border-purple-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-purple-800">
                  {user?.name}
                </h2>
                <p className="text-sm text-purple-600">
                  {user?.role === "admin" ? "Administrator" : "Student"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Notifications */}
              <div className="relative group">
                <Bell
                  size={22}
                  className="text-purple-600 cursor-pointer hover:text-purple-800 transition-colors"
                />

                {/* Show notification count only if there are notifications */}
                {notifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}

                {/* Notification Dropdown */}
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-purple-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4 border-b border-purple-100">
                    <h3 className="font-semibold text-purple-800">
                      Notifications
                    </h3>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 border-b border-purple-50 hover:bg-purple-25 cursor-pointer"
                        >
                          <p className="text-sm text-gray-800">
                            {notification.message}
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No new notifications
                      </div>
                    )}
                  </div>

                  {/* Footer with Logout Button */}
                  <div className="p-4 border-t border-purple-100 space-y-2">
                    {notifications.length > 0 && (
                      <button className="w-full text-center text-sm text-purple-600 hover:text-purple-800 font-medium py-2">
                        View All Notifications
                      </button>
                    )}

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
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
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
