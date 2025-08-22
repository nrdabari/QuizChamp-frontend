import Sidebar from "./sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, LogOut, Bell, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useState, useEffect } from "react";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Close mobile menu on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-sidebar') && !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleOutsideClick);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Close menu on window resize if switching to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  return (
    <div className="h-screen overflow-hidden w-full bg-primary-50 dark:bg-dark-bg-primary flex transition-colors duration-250">
      {/* Desktop Sidebar - Hidden on mobile and tablet */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile Sidebar */}
          <div className="mobile-sidebar relative w-64 h-full bg-primary-800 dark:bg-dark-bg-secondary shadow-xl transform transition-transform duration-300 ease-in-out">
            <Sidebar onItemClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full lg:w-auto min-w-0">
        {/* Compact Header */}
        <div className="bg-white dark:bg-dark-bg-secondary shadow-sm border-b border-primary-100 dark:border-dark-purple-700 px-4 py-2.5 transition-colors duration-250">
          <div className="flex items-center justify-between">
            {/* Left Side - Mobile Menu + User Info */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {/* Mobile Menu Button */}
              <button 
                className="mobile-menu-button lg:hidden p-1.5 rounded-md hover:bg-primary-100 dark:hover:bg-dark-purple-700 transition-colors flex-shrink-0"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={16} className="text-primary-600 dark:text-dark-purple-300" />
              </button>

              {/* User Info - Compact */}
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <div className="w-8 h-8 bg-primary-600 dark:bg-dark-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-white" />
                </div>
                
                {/* User Details - Compact */}
                <div className="hidden sm:block min-w-0 flex-1">
                  <h2 className="text-sm font-semibold font-display text-primary-800 dark:text-text-dark-primary truncate">
                    {user?.name}
                  </h2>
                  <p className="text-xs font-sans text-primary-600 dark:text-dark-purple-300 truncate">
                    {user?.role === "admin" ? "Administrator" : "Student"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side Controls - Compact */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Theme Toggle - Hidden on small mobile screens */}
              {user?.role === "user" && (
                <div className="hidden sm:block">
                  <ThemeToggle variant="header" />
                </div>
              )}

              {/* Notifications Bell - Compact */}
              <div className="relative group">
                <button 
                  className="p-1.5 rounded-md hover:bg-primary-100 dark:hover:bg-dark-purple-700 transition-colors flex items-center justify-center"
                  aria-label="Notifications"
                >
                  <Bell
                    size={16}
                    className="text-primary-600 dark:text-dark-purple-300 cursor-pointer hover:text-primary-800 dark:hover:text-dark-purple-200 transition-colors"
                  />
                </button>

                {/* Responsive Notification Dropdown - Compact */}
                <div className="absolute right-0 mt-1 w-64 sm:w-72 max-w-[calc(100vw-1rem)] bg-white dark:bg-dark-bg-secondary rounded-md shadow-lg dark:shadow-dark border border-primary-100 dark:border-dark-purple-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {/* Dropdown Header - Compact */}
                  <div className="p-3 border-b border-primary-100 dark:border-dark-purple-700">
                    <h3 className="font-semibold font-display text-sm text-primary-800 dark:text-text-dark-primary">
                      Notifications
                    </h3>
                  </div>

                  {/* Empty State - Compact */}
                  <div className="p-3 text-center text-gray-500 dark:text-text-dark-tertiary text-xs font-sans">
                    No new notifications
                  </div>

                  {/* Footer with Logout - Compact */}
                  <div className="p-3 border-t border-primary-100 dark:border-dark-purple-700">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white py-2 px-3 rounded-md transition-colors text-xs font-medium font-sans shadow-sm"
                    >
                      <LogOut size={12} className="flex-shrink-0" />
                      <span className="truncate">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Compact Padding */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-dark-bg-primary transition-colors duration-250">
          <div className="p-4 h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}