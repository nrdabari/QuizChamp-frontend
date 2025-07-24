import { useState } from "react";
import Sidebar from "./sidebar";
import { Outlet, useLocation } from "react-router-dom";
import routes from "../routes";

export default function Layout() {
  const [notifications] = useState([
    { id: 1, message: "New message received", time: "2 min ago" },
    { id: 2, message: "System update available", time: "1 hour ago" },
    { id: 3, message: "Profile updated successfully", time: "3 hours ago" },
  ]);
  const location = useLocation();
  // Match current route to route config
  const matchedRoute = routes.find((r) =>
    location.pathname.startsWith(`${r.layout}/${r.path.split("/:")[0]}`)
  );
  const showSidebar = matchedRoute?.sideBarVisible !== false;
  const showNotificationBar = matchedRoute?.notificationBarVisible !== false;
  return (
    <div className="min-h-screen w-[100%] bg-purple-50 flex">
      {/* Sidebar */}
      {showSidebar && <Sidebar />}

      {/* Right column */}
      {/* Right Side Content */}
      <div className="flex-1 flex flex-col">
        {showNotificationBar && (
          <div className="bg-white shadow-sm border-b border-purple-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  {/* <User size={24} className="text-white" /> */}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-purple-800">
                    John Doe
                  </h2>
                  <p className="text-sm text-purple-600">Administrator</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="relative">
                  {/* <Search size={22} className="text-purple-600 cursor-pointer hover:text-purple-800 transition-colors" /> */}
                </div>
                <div className="relative">
                  {/* <Mail size={22} className="text-purple-600 cursor-pointer hover:text-purple-800 transition-colors" /> */}
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </div>
                <div className="relative group">
                  {/* <Bell size={22} className="text-purple-600 cursor-pointer hover:text-purple-800 transition-colors" /> */}
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>

                  {/* Notification Dropdown */}
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-purple-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4 border-b border-purple-100">
                      <h3 className="font-semibold text-purple-800">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
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
                      ))}
                    </div>
                    <div className="p-4 border-t border-purple-100">
                      <button className="w-full text-center text-sm text-purple-600 hover:text-purple-800 font-medium">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
