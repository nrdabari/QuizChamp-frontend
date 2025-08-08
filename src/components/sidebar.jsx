// components/Sidebar.js
import { Link, useLocation } from "react-router-dom";
import { User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import routes from "../routes";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="w-64 bg-primary-800 dark:bg-dark-bg-secondary text-white flex flex-col min-h-screen transition-colors duration-250">
      {/* Header */}
      <div className="flex items-center justify-center h-16 px-6 bg-primary-900 dark:bg-dark-bg-primary shadow-lg">
        <h1 className="text-xl font-bold font-display text-white">
          Olympiad App
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-8 px-4">
        <div className="space-y-2">
          {routes
            .filter((route) => {
              // Only show routes that should be visible in sidebar
              const isSidebarVisible = route.sideBarVisible;

              // Check if current user's role is allowed for this route
              const hasRoleAccess = route.role
                ? route.role.includes(user?.role)
                : true;

              return isSidebarVisible && hasRoleAccess;
            })
            .map((route) => {
              const Icon = route.icon;
              const fullPath = `${route.layout}/${route.path}`;

              // Better active state checking for dynamic routes
              const isActive =
                location.pathname === fullPath ||
                (route.path.includes(":") &&
                  location.pathname.startsWith(fullPath.split(":")[0]));

              return (
                <Link
                  key={route.name}
                  to={fullPath}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-250 ${
                    isActive
                      ? "bg-primary-700 dark:bg-dark-purple-600 text-white shadow-purple dark:shadow-dark"
                      : "text-primary-100 dark:text-dark-purple-200 hover:bg-primary-700 dark:hover:bg-dark-purple-700 hover:text-white hover:shadow-md"
                  }`}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="font-sans">{route.name}</span>
                </Link>
              );
            })}
        </div>
        {/* Theme Toggle in Navigation Area */}
        {user?.role === "user" && (
          <div className="mt-8 pt-4 border-t border-primary-700 dark:border-dark-purple-700">
            <ThemeToggle variant="sidebar" />
          </div>
        )}
      </nav>
      {/* Footer */}
      <div className="p-4 bg-primary-900 dark:bg-dark-bg-primary border-t border-primary-700 dark:border-dark-purple-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 dark:bg-dark-purple-500 rounded-full flex items-center justify-center shadow-md">
            <User size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium font-sans text-white">
              {user?.name || "Nikita Dabari"}
            </p>
            <p className="text-xs text-primary-200 dark:text-dark-purple-300 font-sans">
              {user?.role === "admin" ? "Administrator" : "User"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
