// components/Sidebar.js
import { Link, useLocation } from "react-router-dom";
import { User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import routes from "../routes";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ onItemClick }) {
  const location = useLocation();
  const { user } = useAuth();

  const handleNavClick = () => {
    // Close mobile menu when navigation item is clicked
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <div className="w-64 bg-primary-800 dark:bg-dark-bg-secondary text-white flex flex-col h-full transition-colors duration-250">
      {/* Compact Header */}
      <div className="flex items-center justify-center h-12 px-4 bg-primary-900 dark:bg-dark-bg-primary shadow-sm">
        <h1 className="text-base font-bold font-display text-white truncate">
          Olympiad App
        </h1>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
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
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary-700 dark:bg-dark-purple-600 text-white shadow-sm"
                      : "text-primary-100 dark:text-dark-purple-200 hover:bg-primary-700 dark:hover:bg-dark-purple-700 hover:text-white"
                  }`}
                >
                  <Icon size={14} className="flex-shrink-0" />
                  <span className="font-sans truncate">{route.name}</span>
                </Link>
              );
            })}
        </div>

        {/* Theme Toggle in Navigation Area - Mobile Only */}
        {user?.role === "user" && (
          <div className="mt-6 pt-4 border-t border-primary-700 dark:border-dark-purple-700 lg:hidden">
            <div className="px-3">
              <ThemeToggle variant="sidebar" />
            </div>
          </div>
        )}
      </nav>

      {/* Compact Footer */}
      <div className="p-3 bg-primary-900 dark:bg-dark-bg-primary border-t border-primary-700 dark:border-dark-purple-700 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 dark:bg-dark-purple-500 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
            <User size={14} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium font-sans text-white truncate">
              Nikita Dabari
            </p>
            <p className="text-xs text-primary-200 dark:text-dark-purple-300 font-sans truncate opacity-75">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
